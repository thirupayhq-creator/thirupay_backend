import { Request, Response, NextFunction } from "express";
import * as kycService from "./kyc.service";
import { successResponse, paginatedResponse } from "../../core/utils/response";
import { logger } from "../../core/config/logger";

export async function submitKyc(
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

    const result = await kycService.submitKyc(userId, req.body);
    logger.info("KYC submitted successfully", { kycId: result.id, userId });
    successResponse(res, result, "KYC submitted successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getStatus(
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

    const status = await kycService.getKycStatus(userId);
    successResponse(res, status, "KYC status fetched successfully");
  } catch (error) {
    next(error);
  }
}

export async function listPending(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const result = await kycService.listPendingKyc(page, limit);
    paginatedResponse(res, result.items, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
}

export async function verifyKyc(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { kycId, decision, rejectionReason } = req.body;
    if (!kycId || !decision) {
      res.status(400).json({ success: false, message: "kycId and decision (APPROVE/REJECT) are required" });
      return;
    }

    if (!["APPROVE", "REJECT"].includes(decision)) {
      res.status(400).json({ success: false, message: "Decision must be APPROVE or REJECT" });
      return;
    }

    const updated = await kycService.verifyKyc(kycId, decision, rejectionReason);
    logger.info("KYC verified by admin", { kycId, decision });
    successResponse(res, updated, `KYC ${decision === "APPROVE" ? "approved" : "rejected"} successfully`);
  } catch (error) {
    next(error);
  }
}
