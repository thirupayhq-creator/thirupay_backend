import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { logger } from "../config/logger";
import { createPayout } from "../services/payout.service";

/**
 * Create Payout
 * POST /api/v1/payouts
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
      amount,
      currency = "INR",
      beneficiaryId,
      metadata,
    } = req.body;

    // 3. Validate amount
    if (amount === undefined || amount === null) {
      res.status(400).json({
        success: false,
        message: "Amount is required",
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

    // Maximum 2 decimal places
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

    // 4. Validate currency
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

    // 5. Validate beneficiary
    if (
      typeof beneficiaryId !== "string" ||
      beneficiaryId.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Beneficiary ID is required",
      });
      return;
    }

    // 6. Validate metadata
    if (
      metadata !== undefined &&
      metadata !== null &&
      typeof metadata !== "object"
    ) {
      res.status(400).json({
        success: false,
        message: "Metadata must be an object",
      });
      return;
    }

    // 7. Find merchant
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

    // 8. Check merchant status
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

    // 9. Create payout
    const payout = await createPayout({
      merchantId: merchant.id,
      amount: numericAmount,
      currency: normalizedCurrency,
      beneficiaryId: beneficiaryId.trim(),
      metadata,
    });

    logger.info("Payout created successfully", {
      payoutId: payout.id,
      merchantId: merchant.id,
      amount: numericAmount,
      currency: normalizedCurrency,
      beneficiaryId: beneficiaryId.trim(),
    });

    // 10. Return payout
    res.status(201).json({
      success: true,
      message: "Payout created successfully",
      data: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        beneficiaryId: payout.beneficiaryId,
        status: payout.status,
        metadata: payout.metadata,
        createdAt: payout.createdAt,
      },
    });
  } catch (error) {
    logger.error("Payout creation failed", error);
    next(error);
  }
}

/**
 * Get Payout
 * GET /api/v1/payouts/:id
 */
export async function getPayout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // 1. Authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 2. Validate payout ID
    if (!id || id.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Payout ID is required",
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

    // 4. Find payout belonging to merchant
    const payout = await prisma.payout.findFirst({
      where: {
        id,
        merchantId: merchant.id,
      },
    });

    if (!payout) {
      res.status(404).json({
        success: false,
        message: "Payout not found",
      });
      return;
    }

    logger.info("Payout fetched successfully", {
      payoutId: payout.id,
      merchantId: merchant.id,
      status: payout.status,
    });

    // 5. Return payout
    res.status(200).json({
      success: true,
      message: "Payout fetched successfully",
      data: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        beneficiaryId: payout.beneficiaryId,
        status: payout.status,
        metadata: payout.metadata,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch payout", error);
    next(error);
  }
}