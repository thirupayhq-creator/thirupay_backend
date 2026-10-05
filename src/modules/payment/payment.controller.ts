import { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.service";
import prisma from "../../core/config/database";
import { successResponse, paginatedResponse, getParam, isValidId } from "../../core/utils/response";
import { logger } from "../../core/config/logger";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let merchantId = req.user?.merchantId;
    if (!merchantId) {
      const merchant = await prisma.merchant.findUnique({
        where: { userId },
      });
      if (!merchant) {
        res.status(404).json({ success: false, message: "Merchant profile not found" });
        return;
      }
      merchantId = merchant.id;
    }

    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    if (!idempotencyKey || !idempotencyKey.trim()) {
      res.status(400).json({
        success: false,
        message: "Idempotency-Key header is required",
      });
      return;
    }

    const payment = await paymentService.createPayment({
      ...req.body,
      merchantId,
      idempotencyKey,
    });

    logger.info("Payment created successfully", {
      paymentId: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
    });

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: {
        id: payment.id,
        orderId: payment.orderId,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        cashfreeOrderId: payment.cashfreeOrderId,
        paymentSessionId: payment.paymentSessionId,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = getParam(req.params.id);
    if (!isValidId(paymentId)) {
      res.status(400).json({ success: false, message: "Invalid payment ID format" });
      return;
    }

    const userId = req.user?.userId;

    let merchantId: string | undefined;
    if (userId && req.user?.role !== "ADMIN") {
      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      merchantId = merchant?.id;
    }

    const result = await paymentService.verifyPayment(paymentId, merchantId);
    logger.info("Payment verified", { paymentId, success: result.success });

    successResponse(
      res,
      {
        ...result.payment,
        verified: result.success,
        providerStatus: result.providerStatus,
      },
      result.success ? "Payment verified successfully" : "Payment is not completed"
    );
  } catch (error) {
    next(error);
  }
}

export async function getPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = getParam(req.params.id);
    if (!isValidId(paymentId)) {
      res.status(400).json({ success: false, message: "Invalid payment ID format" });
      return;
    }

    const userId = req.user?.userId;

    let merchantId: string | undefined;
    if (userId && req.user?.role !== "ADMIN") {
      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      merchantId = merchant?.id;
    }

    const payment = await paymentService.getPaymentById(paymentId, merchantId);
    successResponse(res, payment, "Payment details fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function listPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const merchant = await prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      res.status(404).json({ success: false, message: "Merchant not found" });
      return;
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const result = await paymentService.listPayments(merchant.id, page, limit);
    paginatedResponse(res, result.items, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
}
