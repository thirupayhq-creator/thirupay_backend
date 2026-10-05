import { Router } from "express";

import {
  create,
  getPayout,
} from "../controllers/payout.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * Payout Routes
 */

// Create a new payout
router.post("/", authenticate, create);

// Get payout details
router.get("/:id", authenticate, getPayout);

export default router;