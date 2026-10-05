import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { logger } from "../config/logger";

export async function submitKyc(
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

    const merchant = await prisma.merchant.findUnique({
      where: {
        userId,
      },
      include: {
        kyc: true,
      },
    });

    if (!merchant) {
      res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
      return;
    }

    const {
      provider = "MOCK_KYC",
      providerReference,
    } = req.body;

    // Validate provider
    if (
      typeof provider !== "string" ||
      provider.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "KYC provider is required",
      });
      return;
    }

    // Validate provider reference
    if (
      providerReference !== undefined &&
      providerReference !== null &&
      typeof providerReference !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "providerReference must be a string",
      });
      return;
    }

    // Already submitted
    if (
      merchant.kyc &&
      merchant.kyc.status === "SUBMITTED"
    ) {
      res.status(409).json({
        success: false,
        message:
          "KYC is already submitted and awaiting verification",
        data: {
          kycId: merchant.kyc.id,
          status: merchant.kyc.status,
        },
      });
      return;
    }

    // Already verified
    if (
      merchant.kyc &&
      merchant.kyc.status === "VERIFIED"
    ) {
      res.status(409).json({
        success: false,
        message: "KYC is already verified",
        data: {
          kycId: merchant.kyc.id,
          status: merchant.kyc.status,
        },
      });
      return;
    }

    const now = new Date();

    /*
     * IMPORTANT:
     * Prisma model name = KycVerification
     * Prisma client delegate = kycVerification
     */
    const kyc = await prisma.kycVerification.upsert({
      where: {
        merchantId: merchant.id,
      },

      create: {
        id: crypto.randomUUID(),
        merchantId: merchant.id,
        provider: provider.trim(),
        providerReference:
          typeof providerReference === "string"
            ? providerReference.trim()
            : providerReference,
        status: "SUBMITTED",
        submittedAt: now,
      },

      update: {
        provider: provider.trim(),
        providerReference:
          typeof providerReference === "string"
            ? providerReference.trim()
            : providerReference,
        status: "SUBMITTED",
        submittedAt: now,
        verifiedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    logger.info("KYC submitted successfully", {
      merchantId: merchant.id,
      kycId: kyc.id,
      provider: kyc.provider,
    });

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      data: {
        kycId: kyc.id,
        merchantId: merchant.id,
        provider: kyc.provider,
        providerReference: kyc.providerReference,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
      },
    });
  } catch (error) {
    logger.error("KYC submission failed", error);
    next(error);
  }
}

export async function getKycStatus(
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

    const merchant = await prisma.merchant.findUnique({
      where: {
        userId,
      },
      include: {
        kyc: true,
      },
    });

    if (!merchant) {
      res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
      return;
    }

    if (!merchant.kyc) {
      res.status(404).json({
        success: false,
        message: "KYC application not found",
      });
      return;
    }

    const kyc = merchant.kyc;

    res.status(200).json({
      success: true,
      message: "KYC status fetched successfully",
      data: {
        kycId: kyc.id,
        merchantId: merchant.id,
        status: kyc.status,
        provider: kyc.provider,
        providerReference: kyc.providerReference,
        submittedAt: kyc.submittedAt,
        verifiedAt: kyc.verifiedAt,
        rejectedAt: kyc.rejectedAt,
        rejectionReason: kyc.rejectionReason,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch KYC status", error);
    next(error);
  }
}