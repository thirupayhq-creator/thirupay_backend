
import prisma from "../config/database";
import { getPaymentProvider } from "../providers/payment/payment-provider";
import type { InputJsonValue } from "@prisma/client/runtime/library";

/**
 * Cashfree provider response
 */
interface ProviderPaymentResponse {
  providerRef: string;
  paymentSessionId?: string;
}

/**
 * Create Payment Input
 */
interface CreatePaymentInput {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;

  paymentMethod?:
    | "UPI"
    | "CARD"
    | "NETBANKING"
    | "WALLET";

  description?: string;
  metadata?: InputJsonValue;
  idempotencyKey?: string;

  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Verify Payment Input
 */
interface VerifyPaymentInput {
  paymentId: string;
  merchantId: string;
}

/**
 * Normalize merchant ID
 */
function normalizeMerchantId(merchantId: string | undefined) {
  return merchantId?.trim() || "";
}

/**
 * Create Payment
 *
 * Flow:
 *
 * Frontend
 *   ↓
 * Controller
 *   ↓
 * Payment Service
 *   ↓
 * PostgreSQL Merchant Check
 *   ↓
 * Cashfree
 *   ↓
 * PostgreSQL Payment
 */
export async function createPayment(
  input: CreatePaymentInput
) {
  const merchantId = normalizeMerchantId(
    input.merchantId
  );

  const orderId = input.orderId?.trim() || "";

  const currency =
    input.currency?.trim().toUpperCase() || "";

  const amount = Number(input.amount);

  /**
   * --------------------------------------------------
   * 1. BASIC VALIDATION
   * --------------------------------------------------
   */

  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  if (!currency) {
    throw new Error("Currency is required");
  }

  if (currency !== "INR") {
    throw new Error("Only INR currency is supported");
  }

  /**
   * --------------------------------------------------
   * 2. CHECK MERCHANT
   * --------------------------------------------------
   */

  const merchant =
    await prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
    });

  if (!merchant) {
    throw new Error(
      `Merchant not found: ${merchantId}`
    );
  }

  /**
   * Merchant must be ACTIVE
   */
  if (merchant.status !== "ACTIVE") {
    throw new Error(
      `Merchant is not ACTIVE. Current status: ${merchant.status}`
    );
  }

  /**
   * --------------------------------------------------
   * 3. IDEMPOTENCY CHECK
   * --------------------------------------------------
   */

  if (input.idempotencyKey) {
    const idempotencyKey =
      input.idempotencyKey.trim();

    if (!idempotencyKey) {
      throw new Error(
        "Idempotency key cannot be empty"
      );
    }

    const existingKey =
      await prisma.idempotencyKey.findUnique({
        where: {
          merchantId_key_endpoint: {
            merchantId,
            key: idempotencyKey,
            endpoint: "POST:/api/v1/payments",
          },
        },
      });

    if (existingKey?.responseBody) {
      const response =
        existingKey.responseBody;

      if (
        typeof response !== "object" ||
        response === null ||
        Array.isArray(response) ||
        !("id" in response) ||
        typeof response.id !== "string"
      ) {
        throw new Error(
          "Stored idempotency response is invalid"
        );
      }

      const existingPayment =
        await prisma.payment.findUnique({
          where: {
            id: response.id,
          },
        });

      if (!existingPayment) {
        throw new Error(
          "Stored idempotency payment was not found"
        );
      }

      return existingPayment;
    }
  }

  /**
   * --------------------------------------------------
   * 4. CHECK DUPLICATE ORDER
   * --------------------------------------------------
   */

  const existingPayment =
    await prisma.payment.findUnique({
      where: {
        merchantId_orderId: {
          merchantId,
          orderId,
        },
      },
    });

  if (existingPayment) {
    throw new Error(
      "Payment already exists for this order"
    );
  }

  /**
   * --------------------------------------------------
   * 5. GET PAYMENT PROVIDER
   * --------------------------------------------------
   */

  const provider =
    getPaymentProvider();

  /**
   * --------------------------------------------------
   * 6. CREATE CASHFREE ORDER
   * --------------------------------------------------
   */

  const providerPayment =
    (await provider.createPayment({
      amount,
      currency,
      orderId,
    })) as ProviderPaymentResponse;

  if (!providerPayment?.providerRef) {
    throw new Error(
      "Cashfree order ID was not returned"
    );
  }

  if (!providerPayment.paymentSessionId) {
    throw new Error(
      "Cashfree payment session ID was not returned"
    );
  }

  /**
   * --------------------------------------------------
   * 7. SAVE PAYMENT
   * --------------------------------------------------
   */

  const payment =
    await prisma.payment.create({
      data: {
        merchantId,

        orderId,

        amount,

        currency,

        status: "PENDING",

        paymentMethod:
          input.paymentMethod === "NETBANKING"
            ? "NET_BANKING"
            : input.paymentMethod,

        provider:
          provider.name,

        providerPaymentId:
          providerPayment.providerRef,

        providerOrderId:
          providerPayment.providerRef,

        cashfreeOrderId:
          providerPayment.providerRef,

        paymentSessionId:
          providerPayment.paymentSessionId,

        description:
          input.description?.trim(),

        metadata:
          input.metadata,
      },
    });

  /**
   * --------------------------------------------------
   * 8. SAVE IDEMPOTENCY RESPONSE
   * --------------------------------------------------
   */

  if (input.idempotencyKey) {
    const idempotencyKey =
      input.idempotencyKey.trim();

    try {
      await prisma.idempotencyKey.create({
        data: {
          merchantId,

          key: idempotencyKey,

          endpoint:
            "POST:/api/v1/payments",

          responseBody: {
            id: payment.id,

            orderId:
              payment.orderId,

            amount:
              payment.amount.toString(),

            currency:
              payment.currency,

            status:
              payment.status,

            provider:
              payment.provider,

            providerPaymentId:
              payment.providerPaymentId,

            cashfreeOrderId:
              payment.cashfreeOrderId,

            paymentSessionId:
              payment.paymentSessionId,
          },
        },
      });
    } catch (error) {
      const existingKey =
        await prisma.idempotencyKey.findUnique({
          where: {
            merchantId_key_endpoint: {
              merchantId,

              key: idempotencyKey,

              endpoint:
                "POST:/api/v1/payments",
            },
          },
        });

      if (!existingKey) {
        throw error;
      }
    }
  }

  return payment;
}

/**
 * --------------------------------------------------
 * VERIFY PAYMENT
 * --------------------------------------------------
 */
export async function verifyPayment(
  input: VerifyPaymentInput
) {
  const paymentId =
    input.paymentId?.trim() || "";

  const merchantId =
    normalizeMerchantId(
      input.merchantId
    );

  if (!paymentId) {
    throw new Error(
      "Payment ID is required"
    );
  }

  if (!merchantId) {
    throw new Error(
      "Merchant ID is required"
    );
  }

  /**
   * Find payment belonging
   * to this merchant
   */
  const payment =
    await prisma.payment.findFirst({
      where: {
        id: paymentId,

        merchantId,
      },
    });

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  /**
   * Already successful
   */
  if (payment.status === "SUCCESS") {
    return payment;
  }

  /**
   * Cashfree order ID
   */
  const cashfreeOrderId =
    payment.cashfreeOrderId ||
    payment.providerPaymentId;

  if (!cashfreeOrderId) {
    throw new Error(
      "Cashfree order ID not found"
    );
  }

  /**
   * Get provider
   */
  const provider =
    getPaymentProvider();

  /**
   * Verify through Cashfree
   */
  const verification =
    await provider.verifyPayment(
      cashfreeOrderId
    );

  /**
   * Update status
   */
  const newStatus =
    verification.success
      ? "SUCCESS"
      : "PENDING";

  const updatedPayment =
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: newStatus,

        paidAt:
          newStatus === "SUCCESS"
            ? payment.paidAt ??
              new Date()
            : payment.paidAt,
      },
    });

  return updatedPayment;
}

/**
 * --------------------------------------------------
 * GET PAYMENT BY ID
 * --------------------------------------------------
 */
export async function getPaymentById(
  paymentId: string,
  merchantId: string
) {
  const normalizedPaymentId =
    paymentId?.trim() || "";

  const normalizedMerchantId =
    normalizeMerchantId(
      merchantId
    );

  if (!normalizedPaymentId) {
    throw new Error(
      "Payment ID is required"
    );
  }

  if (!normalizedMerchantId) {
    throw new Error(
      "Merchant ID is required"
    );
  }

  const payment =
    await prisma.payment.findFirst({
      where: {
        id: normalizedPaymentId,

        merchantId:
          normalizedMerchantId,
      },

      include: {
        refunds: true,

        webhookEvents: true,
      },
    });

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  return payment;
}
