import { Router } from "express";

import {
  submitKyc,
  getKycStatus,
} from "../controllers/kyc.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * KYC Routes
 */

// Submit KYC application
router.post("/submit", authenticate, submitKyc);

// Get current user's KYC status
router.get("/status", authenticate, getKycStatus);

export default router;