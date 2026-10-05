import prisma from "../../core/config/database";
import { getPaymentProvider } from "../payment/providers";
import { RefundStatus } from "@prisma/client";

interface CreateRefundOptions {
  paymentId: string;
  merchantId: string;
  amount: number;
  reason?: string;
}

export async function createRefund(options: CreateRefundOptions) {
  const { paymentId, merchantId, amount, reason } = options;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { refunds: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.merchantId !== merchantId) {
    throw new Error("Payment does not belong to this merchant");
  }

  if (payment.status !== "SUCCESS" && payment.status !== "PARTIALLY_REFUNDED") {
    throw new Error(
      `Cannot refund a payment with status '${payment.status}'. Only successful payments can be refunded.`
    );
  }

  const existingRefundTotal = payment.refunds
    .filter((r) => r.status === "SUCCESS" || r.status === "PROCESSING")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const paymentAmount = Number(payment.amount);
  if (existingRefundTotal + amount > paymentAmount) {
    const refundableBalance = Math.max(0, paymentAmount - existingRefundTotal);
    throw new Error(
      `Refund amount exceeds refundable balance. Maximum refundable amount: ₹${refundableBalance.toFixed(2)}`
    );
  }

  // Call Cashfree / Mock refund
  const provider = getPaymentProvider();
  const targetOrderId = payment.cashfreeOrderId || payment.orderId;
  const providerRefund = await provider.refundPayment(targetOrderId, amount, reason);

  let refundStatus: RefundStatus = "PROCESSING";
  if (providerRefund.refundStatus === "SUCCESS") {
    refundStatus = "SUCCESS";
  } else if (providerRefund.refundStatus === "FAILED") {
    refundStatus = "FAILED";
  }

  const newTotalRefunded = existingRefundTotal + amount;
  const newPaymentStatus =
    newTotalRefunded >= paymentAmount ? "REFUNDED" : "PARTIALLY_REFUNDED";

  const refund = await prisma.$transaction(async (tx) => {
    const r = await tx.refund.create({
      data: {
        merchantId,
        paymentId: payment.id,
        amount,
        currency: payment.currency,
        status: refundStatus,
        provider: provider.name,
        providerRefundId: providerRefund.providerRef,
        reason,
        processedAt: refundStatus === "SUCCESS" ? new Date() : null,
      },
    });

    if (refundStatus === "SUCCESS") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newPaymentStatus },
      });
    }

    return r;
  });

  return refund;
}

export async function getRefundById(refundId: string, merchantId?: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: {
      payment: {
        select: {
          id: true,
          orderId: true,
          amount: true,
          currency: true,
          status: true,
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund record not found");
  }

  if (merchantId && refund.merchantId !== merchantId) {
    throw new Error("Refund record not found");
  }

  return refund;
}

export async function listRefunds(merchantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.refund.findMany({
      where: { merchantId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        payment: {
          select: {
            orderId: true,
            amount: true,
          },
        },
      },
    }),
    prisma.refund.count({ where: { merchantId } }),
  ]);

  return { items, total, page, limit };
}
