import { Router } from "express";
import * as merchantController from "./merchant.controller";
import { authenticate, authorizeAdmin } from "../../core/middleware/auth.middleware";
import { validateBody } from "../../core/middleware/validation.middleware";
import { onboardMerchantSchema, updateMerchantStatusSchema } from "./merchant.schema";

const router = Router();

// Public merchant lookup (used by hosted payment pages / links)
router.get("/public/:merchantId", merchantController.getPublicMerchant);

// Merchant self routes
router.post(
  "/onboard",
  authenticate,
  validateBody(onboardMerchantSchema),
  merchantController.onboardMerchant
);

router.post(
  "/",
  authenticate,
  validateBody(onboardMerchantSchema),
  merchantController.onboardMerchant
);


router.get("/profile", authenticate, merchantController.getProfile);
router.get("/me", authenticate, merchantController.getProfile);
router.get("/cashfree-onboarding-link", authenticate, merchantController.getCashfreeOnboardingLink);
router.post("/cashfree-sync", authenticate, merchantController.syncCashfreeStatus);

// Admin routes
router.get("/", authenticate, authorizeAdmin, merchantController.listMerchants);
router.patch(
  "/:id/status",
  authenticate,
  authorizeAdmin,
  validateBody(updateMerchantStatusSchema),
  merchantController.updateStatus
);

export default router;
