import { Router } from "express";

import { cashfreeWebhook } from "../controllers/webhook.controller";

const router = Router();

/**
 * Cashfree Webhook Routes
 *
 * IMPORTANT:
 * The "/payment" route should be configured in Cashfree
 * as the webhook notification URL.
 */

// Cashfree payment webhook
router.post("/payment", cashfreeWebhook);

export default router;