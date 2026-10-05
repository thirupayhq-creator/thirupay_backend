import { Request, Response, NextFunction } from "express";
import * as payoutService from "./payout.service";
import prisma from "../../core/config/database";
import { successResponse, paginatedResponse, getParam } from "../../core/utils/response";
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

    const payout = await payoutService.createPayout({
      ...req.body,
      merchantId: merchant.id,
    });

    logger.info("Payout created", { payoutId: payout.id, merchantId: merchant.id });
    successResponse(res, payout, "Payout initiated successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getPayout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    let merchantId: string | undefined;
    if (userId && req.user?.role !== "ADMIN") {
      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      merchantId = merchant?.id;
    }

    const payout = await payoutService.getPayoutById(id, merchantId);
    successResponse(res, payout, "Payout details fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function listPayouts(
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

    const result = await payoutService.listPayouts(merchant.id, page, limit);
    paginatedResponse(res, result.items, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
}
