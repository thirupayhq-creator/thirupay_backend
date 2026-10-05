import { Router } from "express";
import * as kycController from "./kyc.controller";
import { authenticate, authorizeAdmin } from "../../core/middleware/auth.middleware";

const router = Router();

// Merchant KYC endpoints
router.post("/submit", authenticate, kycController.submitKyc);
router.get("/status", authenticate, kycController.getStatus);

// Admin KYC verification endpoints
router.get("/pending", authenticate, authorizeAdmin, kycController.listPending);
router.post("/verify", authenticate, authorizeAdmin, kycController.verifyKyc);

export default router;
