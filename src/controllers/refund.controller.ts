import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { logger } from "../config/logger";
import { createRefund } from "../services/refund.service";

/**
 * Create Refund
 * POST /api/v1/payments/:id/refund
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const paymentId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { amount, reason } = req.body;

    // 1. Authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 2. Validate payment ID
    if (!paymentId || paymentId.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
      return;
    }

    // 3. Validate refund amount
    if (amount === undefined || amount === null) {
      res.status(400).json({
        success: false,
        message: "Refund amount is required",
      });
      return;
    }

    const refundAmount = Number(amount);

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Refund amount must be greater than zero",
      });
      return;
    }

    // Maximum 2 decimal places
    if (!Number.isInteger(refundAmount * 100)) {
      res.status(400).json({
        success: false,
        message: "Refund amount can have a maximum of 2 decimal places",
      });
      return;
    }

    // 4. Validate reason if supplied
    if (
      reason !== undefined &&
      reason !== null &&
      typeof reason !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Refund reason must be a string",
      });
      return;
    }

    const normalizedReason =
      typeof reason === "string"
        ? reason.trim()
        : reason;

    // 5. Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: {
        userId,
      },
    });

    if (!merchant) {
      res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
      return;
    }

    // 6. Check merchant status
    if (merchant.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        message: "Merchant is not active",
        data: {
          merchantId: merchant.id,
          status: merchant.status,
        },
      });
      return;
    }

    // 7. Find payment belonging to merchant
    const payment = (await prisma.payment.findFirst({
      where: {
        id: paymentId,
        merchantId: merchant.id,
      },
      include: {
        refunds: true,
      },
    })) as any;

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    // 8. Only successful payments can be refunded
    if (payment.status !== "SUCCESS") {
      res.status(400).json({
        success: false,
        message: "Only successful payments can be refunded",
        data: {
          paymentId: payment.id,
          status: payment.status,
        },
      });
      return;
    }

    // 9. Calculate already refunded amount
    const alreadyRefunded = (payment.refunds ?? []).reduce(
      (
        total: number,
        refund: {
          status?: string;
          amount?: number | string | { toString(): string };
        }
      ) => {
        if (
          refund.status === "SUCCESS" ||
          refund.status === "PENDING"
        ) {
          return total + Number(refund.amount ?? 0);
        }

        return total;
      },
      0
    );

    const paymentAmount = Number(payment.amount);
    const remainingRefundable =
      paymentAmount - alreadyRefunded;

    // 10. Prevent refund above remaining amount
    if (refundAmount > remainingRefundable) {
      res.status(400).json({
        success: false,
        message: "Refund amount exceeds the remaining refundable amount",
        data: {
          paymentAmount,
          alreadyRefunded,
          remainingRefundable,
          requestedRefund: refundAmount,
        },
      });
      return;
    }

    // 11. Create refund
    const refund = await createRefund({
      paymentId: payment.id,
      merchantId: merchant.id,
      amount: refundAmount,
      reason: normalizedReason,
    });

    logger.info("Refund created successfully", {
      refundId: refund.id,
      paymentId: payment.id,
      merchantId: merchant.id,
      amount: refundAmount,
      status: refund.status,
    });

    // 12. Return response
    res.status(201).json({
      success: true,
      message: "Refund created successfully",
      data: {
        id: refund.id,
        paymentId: refund.paymentId,
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        createdAt: refund.createdAt,
      },
    });
  } catch (error) {
    logger.error("Refund creation failed", error);
    next(error);
  }
}