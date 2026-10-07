import { Router } from "express";
import * as kycController from "./kyc.controller";
import { authenticate, authorizeAdmin } from "../../core/middleware/auth.middleware";
import { validateBody } from "../../core/middleware/validation.middleware";
import { submitKycSchema, verifyKycSchema } from "./kyc.schema";

const router = Router();

// Merchant KYC endpoints
router.post(
  "/submit",
  authenticate,
  validateBody(submitKycSchema),
  kycController.submitKyc
);
router.get("/status", authenticate, kycController.getStatus);

// Admin KYC verification endpoints
router.get("/pending", authenticate, authorizeAdmin, kycController.listPending);
router.get("/", authenticate, authorizeAdmin, kycController.listAll);
router.get("/:id", authenticate, authorizeAdmin, kycController.getKycById);
router.post(
  "/verify",
  authenticate,
  authorizeAdmin,
  validateBody(verifyKycSchema),
  kycController.verifyKyc
);

export default router;

