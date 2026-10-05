import { Request, Response, NextFunction } from "express";
import * as refundService from "./refund.service";
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

    const merchant = await prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      res.status(404).json({ success: false, message: "Merchant not found" });
      return;
    }

    const paymentId = getParam(req.params.id) || req.body.paymentId;
    if (!paymentId || !isValidId(paymentId)) {
      res.status(400).json({ success: false, message: "Invalid payment ID format" });
      return;
    }

    const { amount, reason } = req.body;
    const refund = await refundService.createRefund({
      paymentId,
      merchantId: merchant.id,
      amount: Number(amount),
      reason,
    });

    logger.info("Refund initiated successfully", {
      refundId: refund.id,
      paymentId,
      amount,
    });

    successResponse(res, refund, "Refund processed successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getRefund(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) {
      res.status(400).json({ success: false, message: "Invalid refund ID format" });
      return;
    }

    const userId = req.user?.userId;

    let merchantId: string | undefined;
    if (userId && req.user?.role !== "ADMIN") {
      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      merchantId = merchant?.id;
    }

    const refund = await refundService.getRefundById(id, merchantId);
    successResponse(res, refund, "Refund details fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function listRefunds(
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

    const result = await refundService.listRefunds(merchant.id, page, limit);
    paginatedResponse(res, result.items, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
}
