import { Request, Response, NextFunction } from "express";
import {
  onboardMerchant as onboardMerchantService,
  getMerchantProfile as getMerchantProfileService,
} from "../services/merchant.service";
import prisma from "../config/database";
import { logger } from "../config/logger";

export async function onboardMerchant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { businessName, businessType, phone } = req.body;

    if (
      typeof businessName !== "string" ||
      businessName.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Business name is required",
      });
      return;
    }

    if (
      businessType !== undefined &&
      typeof businessType !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Business type must be a string",
      });
      return;
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Phone must be a string",
      });
      return;
    }

    const merchant = await onboardMerchantService({
      userId,
      businessName,
      businessType,
      phone,
    });

    logger.info("Merchant onboarded successfully", {
      merchantId: merchant.id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Merchant onboarded successfully",
      data: {
        merchant,
      },
    });
  } catch (error) {
    logger.error("Merchant onboarding failed", error);
    next(error);
  }
}

export async function getMerchantProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const merchant = await getMerchantProfileService(userId);

    res.status(200).json({
      success: true,
      message: "Merchant profile fetched successfully",
      data: {
        merchant,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch merchant profile", error);
    next(error);
  }
}

export async function getPublicMerchant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { merchantId } = req.params;

    if (
      typeof merchantId !== "string" ||
      merchantId.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Merchant ID is required",
      });
      return;
    }

    const merchant = await prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        status: true,
      },
    });

    if (!merchant) {
      res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
      return;
    }

    if (merchant.status === "SUSPENDED") {
      res.status(403).json({
        success: false,
        message: "Merchant account is unavailable",
      });
      return;
    }

    logger.info("Public merchant fetched", {
      merchantId: merchant.id,
      status: merchant.status,
    });

    res.status(200).json({
      success: true,
      message: "Merchant fetched successfully",
      data: {
        merchantId: merchant.id,
        id: merchant.id,
        businessName: merchant.businessName,
        businessType: merchant.businessType,
        status: merchant.status,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch public merchant", error);
    next(error);
  }
}