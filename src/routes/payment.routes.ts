import { Router } from "express";

import {
  create,
  verify,
  getPayment,
} from "../controllers/payment.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * Payment Routes
 */

// Create a new Cashfree payment/order
router.post("/", authenticate, create);

// Get payment details
router.get("/:id", authenticate, getPayment);

// Verify payment status
router.post("/:id/verify", authenticate, verify);

export default router;