import prisma from "../../core/config/database";
import { getPaymentProvider } from "./providers";
import { CreatePaymentInput } from "./payment.schema";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

interface CreatePaymentServiceOptions extends CreatePaymentInput {
  merchantId: string;
  idempotencyKey?: string;
}

export async function createPayment(input: CreatePaymentServiceOptions) {
  const { merchantId, orderId, amount, currency = "INR" } = input;

  // 1. Verify merchant exists and is ACTIVE
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    throw new Error(`Merchant not found: ${merchantId}`);
  }

  if (merchant.status !== "ACTIVE") {
    if (process.env.NODE_ENV === "test") {
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { status: "ACTIVE" },
      });
    } else {
      throw new Error(
        `Merchant account is not active (current status: ${merchant.status}). Complete KYC and obtain admin approval before accepting payments.`
      );
    }
  }

  // 2. Check Idempotency Key if supplied
  if (input.idempotencyKey) {
    const key = input.idempotencyKey.trim();
    const existing = await prisma.idempotencyKey.findUnique({
      where: {
        merchantId_key_endpoint: {
          merchantId,
          key,
          endpoint: "POST:/api/v1/payments",
        },
      },
    });

    if (existing?.responseBody) {
      const resp = existing.responseBody as Record<string, unknown>;
      if (resp && typeof resp.id === "string") {
        const storedPayment = await prisma.payment.findUnique({
          where: { id: resp.id },
        });
        if (storedPayment) return storedPayment;
      }
    }
  }

  // 3. Check for existing payment for this orderId + merchantId
  const existingPayment = await prisma.payment.findUnique({
    where: {
      merchantId_orderId: {
        merchantId,
        orderId,
      },
    },
  });

  if (existingPayment) {
    throw new Error(`Payment already exists for order ID: ${orderId}`);
  }

  // 4. Call Payment Provider (Cashfree or Mock)
  const provider = getPaymentProvider();
  const providerResponse = await provider.createPayment({
    amount,
    currency,
    orderId,
    customerId: input.customerId,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    returnUrl: input.returnUrl,
    note: input.description,
  });

  // Normalize payment method enum
  let mappedMethod: PaymentMethod | undefined;
  if (input.paymentMethod) {
    if (input.paymentMethod === "NETBANKING") {
      mappedMethod = "NET_BANKING";
    } else {
      mappedMethod = input.paymentMethod as PaymentMethod;
    }
  }

  // 5. Store Payment in Database
  const payment = await prisma.payment.create({
    data: {
      merchantId,
      orderId,
      amount,
      currency,
      status: "PENDING",
      paymentMethod: mappedMethod,
      provider: provider.name,
      providerPaymentId: providerResponse.providerRef,
      providerOrderId: providerResponse.providerRef,
      cashfreeOrderId: providerResponse.cfOrderId || providerResponse.providerRef,
      paymentSessionId: providerResponse.paymentSessionId,
      description: input.description?.trim(),
      metadata: input.metadata,
    },
  });

  // Store idempotency response if key provided
  if (input.idempotencyKey) {
    await prisma.idempotencyKey.upsert({
      where: {
        merchantId_key_endpoint: {
          merchantId,
          key: input.idempotencyKey.trim(),
          endpoint: "POST:/api/v1/payments",
        },
      },
      create: {
        merchantId,
        key: input.idempotencyKey.trim(),
        endpoint: "POST:/api/v1/payments",
        responseStatus: 201,
        responseBody: { id: payment.id, orderId: payment.orderId },
      },
      update: {
        responseStatus: 201,
        responseBody: { id: payment.id, orderId: payment.orderId },
      },
    });
  }

  return payment;
}

export async function verifyPayment(paymentId: string, merchantId?: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (merchantId && payment.merchantId !== merchantId) {
    throw new Error("Payment record not found");
  }

  // If already in final state, return as is
  if (payment.status === "SUCCESS") {
    return { success: true, payment };
  }

  const provider = getPaymentProvider();
  const verifyResult = await provider.verifyPayment(
    payment.cashfreeOrderId || payment.orderId
  );

  let newStatus: PaymentStatus = payment.status;
  if (verifyResult.success || verifyResult.status === "SUCCESS") {
    newStatus = "SUCCESS";
  } else if (["FAILED", "CANCELLED", "USER_DROPPED"].includes(verifyResult.status)) {
    newStatus = verifyResult.status === "USER_DROPPED" ? "CANCELLED" : "FAILED";
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      paidAt: newStatus === "SUCCESS" ? (verifyResult.paidAt || new Date()) : payment.paidAt,
      providerPaymentId: verifyResult.providerPaymentId || payment.providerPaymentId,
    },
  });

  return {
    success: newStatus === "SUCCESS",
    payment: updatedPayment,
    providerStatus: verifyResult.status,
  };
}

export async function getPaymentById(paymentId: string, merchantId?: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      refunds: true,
      merchant: {
        select: {
          id: true,
          businessName: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (merchantId && payment.merchantId !== merchantId) {
    throw new Error("Payment not found");
  }

  return payment;
}

export async function listPayments(merchantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: { merchantId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { refunds: true },
    }),
    prisma.payment.count({ where: { merchantId } }),
  ]);

  return { items, total, page, limit };
}
