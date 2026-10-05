import { Router } from "express";
import * as refundController from "./refund.controller";
import { authenticate } from "../../core/middleware/auth.middleware";
import { validateBody } from "../../core/middleware/validation.middleware";
import { createRefundSchema } from "./refund.schema";

const router = Router();

// List merchant refunds
router.get("/refunds", authenticate, refundController.listRefunds);

// Get specific refund
router.get("/refunds/:id", authenticate, refundController.getRefund);

// Create refund for a payment
router.post(
  "/payments/:id/refund",
  authenticate,
  validateBody(createRefundSchema),
  refundController.create
);

// Alternate route: POST /refunds
router.post(
  "/refunds",
  authenticate,
  validateBody(createRefundSchema),
  refundController.create
);

export default router;
