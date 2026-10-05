import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { logger } from "../config/logger";
import {
  createPayment,
  verifyPayment,
} from "../services/payment.service";

const asSingleString = (
  value: string | string[] | undefined
): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * Create Payment
 * POST /api/v1/payments
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    // 1. Authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 2. Request body
    const {
      orderId,
      amount,
      currency = "INR",
      paymentMethod,
      description,
      metadata,
    } = req.body;

    // 3. Validate order ID
    if (
      typeof orderId !== "string" ||
      orderId.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    // 4. Validate amount
    if (amount === undefined || amount === null) {
      res.status(400).json({
        success: false,
        message: "amount is required",
      });
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
      return;
    }

    // Optional: prevent invalid decimal precision
    const amountInCents = numericAmount * 100;
    if (
      Math.abs(amountInCents - Math.round(amountInCents)) >
      1e-9
    ) {
      res.status(400).json({
        success: false,
        message: "Amount can have a maximum of 2 decimal places",
      });
      return;
    }

    // 5. Validate currency
    const normalizedCurrency = String(currency)
      .trim()
      .toUpperCase();

    if (normalizedCurrency !== "INR") {
      res.status(400).json({
        success: false,
        message: "Only INR currency is supported",
      });
      return;
    }

    // 6. Validate optional fields
    if (
      paymentMethod !== undefined &&
      paymentMethod !== null &&
      typeof paymentMethod !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "paymentMethod must be a string",
      });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "description must be a string",
      });
      return;
    }

    if (
      metadata !== undefined &&
      metadata !== null &&
      typeof metadata !== "object"
    ) {
      res.status(400).json({
        success: false,
        message: "metadata must be an object",
      });
      return;
    }

    // 7. Idempotency key
    const idempotencyHeader =
      req.header("Idempotency-Key");
    const idempotencyKey = Array.isArray(idempotencyHeader)
      ? idempotencyHeader[0]?.trim()
      : idempotencyHeader?.trim();

    if (!idempotencyKey) {
      res.status(400).json({
        success: false,
        message: "Idempotency-Key header is required",
      });
      return;
    }

    if (idempotencyKey.length > 100) {
      res.status(400).json({
        success: false,
        message: "Idempotency-Key is too long",
      });
      return;
    }

    // 8. Find merchant
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

    // 9. Check merchant status
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

    // 10. Create payment
    const payment = await createPayment({
      merchantId: merchant.id,
      orderId: orderId.trim(),
      amount: numericAmount,
      currency: normalizedCurrency,
      paymentMethod:
        typeof paymentMethod === "string"
          ? paymentMethod.trim()
          : paymentMethod,
      description:
        typeof description === "string"
          ? description.trim()
          : description,
      metadata,
      idempotencyKey,
    });

    logger.info("Cashfree payment created", {
      paymentId: payment.id,
      merchantId: merchant.id,
      orderId: payment.orderId,
      cashfreeOrderId: payment.cashfreeOrderId,
    });

    // 11. Return checkout information
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,

        // Required by Cashfree frontend checkout
        cashfreeOrderId: payment.cashfreeOrderId,
        paymentSessionId: payment.paymentSessionId,

        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    logger.error("Cashfree payment creation failed", error);
    next(error);
  }
}

/**
 * Verify Payment
 * POST /api/v1/payments/:id/verify
 */
export async function verify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = asSingleString(req.params.id);

    // 1. Authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 2. Validate payment ID
    if (!id || id.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
      return;
    }

    // 3. Find merchant
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

    // 4. Find payment belonging to this merchant
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        merchantId: merchant.id,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    // 5. If already successful, don't unnecessarily verify again
    if (payment.status === "SUCCESS") {
      res.status(200).json({
        success: true,
        message: "Payment is already verified",
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          cashfreeOrderId: payment.cashfreeOrderId,
          paymentSessionId: payment.paymentSessionId,
          verifiedAt: payment.updatedAt,
        },
      });
      return;
    }

    // 6. Verify payment through Cashfree
    const result = await verifyPayment({
      paymentId: payment.id,
      merchantId: merchant.id,
    });

    logger.info("Cashfree payment verification completed", {
      paymentId: payment.id,
      merchantId: merchant.id,
      cashfreeOrderId: payment.cashfreeOrderId,
      status: result.status,
    });

    // 7. Return result
    res.status(200).json({
      success: true,
      message: "Payment verification completed",
      data: result,
    });
  } catch (error) {
    logger.error("Cashfree payment verification failed", error);
    next(error);
  }
}

/**
 * Get Payment
 * GET /api/v1/payments/:id
 */
export async function getPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = asSingleString(req.params.id);

    // 1. Authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 2. Validate payment ID
    if (!id || id.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
      return;
    }

    // 3. Find merchant
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

    // 4. Find payment belonging to merchant
    const payment = (await prisma.payment.findFirst({
      where: {
        id,
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

    logger.info("Payment fetched successfully", {
      paymentId: payment.id,
      merchantId: merchant.id,
      status: payment.status,
    });

    // 5. Return payment
    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        description: payment.description,

        cashfreeOrderId: payment.cashfreeOrderId,
        paymentSessionId: payment.paymentSessionId,

        metadata: payment.metadata,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,

        refunds: payment.refunds,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch payment", error);
    next(error);
  }
}