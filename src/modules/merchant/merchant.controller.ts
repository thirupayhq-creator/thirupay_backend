import { Request, Response, NextFunction } from "express";
import * as merchantService from "./merchant.service";
import { successResponse, paginatedResponse, getParam } from "../../core/utils/response";
import { logger } from "../../core/config/logger";

export async function onboardMerchant(
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

    const merchant = await merchantService.onboardMerchant(userId, req.body);
    logger.info("Merchant onboarded successfully", { merchantId: merchant.id, userId });
    successResponse(res, { ...merchant, merchant }, "Merchant onboarded successfully");
  } catch (error) {
    next(error);
  }
}

export async function getProfile(
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

    const merchant = await merchantService.getMerchantProfile(userId);
    successResponse(res, { ...merchant, merchant }, "Merchant profile fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function getPublicMerchant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const merchantId = getParam(req.params.merchantId || req.params.id);
    if (!merchantId) {
      res.status(400).json({ success: false, message: "Merchant ID is required" });
      return;
    }

    const merchant = await merchantService.getPublicMerchant(merchantId);
    successResponse(res, merchant, "Merchant fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function listMerchants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const result = await merchantService.listMerchants(page, limit);
    paginatedResponse(res, result.items, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const { status } = req.body;

    const updated = await merchantService.updateMerchantStatus(id, status);
    logger.info("Merchant status updated", { merchantId: id, status });
    successResponse(res, updated, "Merchant status updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function getCashfreeOnboardingLink(
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

    const data = await merchantService.getCashfreeOnboardingLink(userId);
    successResponse(res, data, "Cashfree onboarding link retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function syncCashfreeStatus(
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

    const data = await merchantService.syncCashfreeStatus(userId);
    successResponse(res, data, "Cashfree status synced successfully");
  } catch (error) {
    next(error);
  }
}
