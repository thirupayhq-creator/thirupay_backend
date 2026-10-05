import { Router } from "express";

import {
  onboardMerchant,
  getMerchantProfile,
  getPublicMerchant,
} from "../controllers/merchant.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * ==========================================
 * MERCHANT ROUTES
 * ==========================================
 */

/**
 * Merchant onboarding
 *
 * POST /api/v1/merchants/onboard
 */
router.post(
  "/onboard",
  authenticate,
  onboardMerchant
);

/**
 * Authenticated merchant profile
 *
 * GET /api/v1/merchants/profile
 */
router.get(
  "/profile",
  authenticate,
  getMerchantProfile
);

/**
 * Public merchant details
 *
 * Used by the customer payment page
 * after scanning a merchant QR code.
 *
 * GET /api/v1/merchants/:merchantId
 */
router.get("/:merchantId", getPublicMerchant);

export default router;