import { Router } from "express";

import { create } from "../controllers/refund.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * Refund Routes
 */

// Create a refund for a payment
router.post("/payments/:id/refund", authenticate, create);

export default router;