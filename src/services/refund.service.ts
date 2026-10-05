import prisma from "../config/database";
import { getPaymentProvider } from "../providers/payment/payment-provider";

interface CreateRefundInput {
  paymentId: string;
  merchantId: string;
  amount: number;
  reason?: string;
}

/**
 * Create Refund
 *
 * Flow:
 *
 * Controller
 *    ↓
 * Refund Service
 *    ↓
 * Cashfree Provider
 *    ↓
 * Cashfree Refund API
 *    ↓
 * PostgreSQL
 */
export async function createRefund(
  input: CreateRefundInput
) {
  const paymentId = input.paymentId?.trim();
  const merchantId = input.merchantId?.trim();
  const amount = Number(input.amount);
  const reason = input.reason?.trim() || undefined;

  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Refund amount must be greater than zero"
    );
  }

  if (Math.round(amount * 100) !== amount * 100) {
    throw new Error(
      "Refund amount can have a maximum of 2 decimal places"
    );
  }

  if (reason && reason.length > 500) {
    throw new Error("Refund reason is too long");
  }

  /**
   * ----------------------------------------------------------
   * 1. FIND PAYMENT
   * ----------------------------------------------------------
   */
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      merchantId,
    },
    include: {
      refunds: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  /**
   * ----------------------------------------------------------
   * 2. PAYMENT MUST BE SUCCESSFUL
   * ----------------------------------------------------------
   */
  if (payment.status !== "SUCCESS") {
    throw new Error(
      "Only successful payments can be refunded"
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. CALCULATE ALREADY REFUNDED AMOUNT
   * ----------------------------------------------------------
   *
   * Only SUCCESS refunds count toward the refundable
   * amount.
   */
  const previousRefundAmount =
    payment.refunds.reduce((total, refund) => {
      if (refund.status === "SUCCESS") {
        return total + Number(refund.amount);
      }

      return total;
    }, 0);

  const paymentAmount = Number(payment.amount);

  const remainingRefundable =
    paymentAmount - previousRefundAmount;

  if (remainingRefundable <= 0) {
    throw new Error(
      "Payment has already been fully refunded"
    );
  }

  if (amount > remainingRefundable) {
    throw new Error(
      `Refund amount exceeds refundable amount of ${remainingRefundable.toFixed(
        2
      )}`
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. CHECK PROVIDER REFERENCE
   * ----------------------------------------------------------
   */
  if (!payment.providerPaymentId) {
    throw new Error(
      "Provider payment reference not found"
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. GET PAYMENT PROVIDER
   * ----------------------------------------------------------
   */
  const provider = getPaymentProvider();

  /**
   * ----------------------------------------------------------
   * 6. CREATE REFUND WITH PROVIDER
   * ----------------------------------------------------------
   */
  const providerRefund =
    await provider.refundPayment(
      payment.providerPaymentId,
      amount
    );

  if (!providerRefund?.providerRef) {
    throw new Error(
      "Provider refund reference was not returned"
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. SAVE REFUND
   * ----------------------------------------------------------
   */
  const refund = await prisma.refund.create({
    data: {
      paymentId: payment.id,
      merchantId,
      amount,
      reason,
      provider: provider.name,
      providerRefundId:
        providerRefund.providerRef,
      status: "SUCCESS",
      processedAt: new Date(),
    },
  });

  /**
   * ----------------------------------------------------------
   * 8. UPDATE PAYMENT STATUS
   * ----------------------------------------------------------
   */
  const totalRefunded =
    previousRefundAmount + amount;

  if (totalRefunded >= paymentAmount) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "REFUNDED",
      },
    });
  } else {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "PARTIALLY_REFUNDED",
      },
    });
  }

  return refund;
}

/**
 * Get Refund By ID
 */
export async function getRefundById(
  refundId: string,
  merchantId: string
) {
  const normalizedRefundId =
    refundId?.trim();

  const normalizedMerchantId =
    merchantId?.trim();

  if (!normalizedRefundId) {
    throw new Error("Refund ID is required");
  }

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const refund =
    await prisma.refund.findFirst({
      where: {
        id: normalizedRefundId,
        merchantId: normalizedMerchantId,
      },
      include: {
        payment: true,
      },
    });

  if (!refund) {
    throw new Error("Refund not found");
  }

  return refund;
}

/**
 * Get All Refunds For A Payment
 */
export async function getPaymentRefunds(
  paymentId: string,
  merchantId: string
) {
  const normalizedPaymentId =
    paymentId?.trim();

  const normalizedMerchantId =
    merchantId?.trim();

  if (!normalizedPaymentId) {
    throw new Error("Payment ID is required");
  }

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const payment =
    await prisma.payment.findFirst({
      where: {
        id: normalizedPaymentId,
        merchantId: normalizedMerchantId,
      },
    });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return prisma.refund.findMany({
    where: {
      paymentId: normalizedPaymentId,
      merchantId: normalizedMerchantId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}