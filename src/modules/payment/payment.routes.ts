import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticate } from "../../core/middleware/auth.middleware";
import { validateBody } from "../../core/middleware/validation.middleware";
import { paymentRateLimiter } from "../../core/middleware/rate-limit.middleware";
import { createPaymentSchema } from "./payment.schema";

const router = Router();

// Create new payment order (Cashfree order creation)
router.post(
  "/",
  authenticate,
  paymentRateLimiter,
  validateBody(createPaymentSchema),
  paymentController.create
);

// List merchant payments
router.get("/", authenticate, paymentController.listPayments);

// Get payment details
router.get("/:id", authenticate, paymentController.getPayment);

// Verify payment status with Cashfree
router.post("/:id/verify", authenticate, paymentController.verify);

export default router;
