import { Router } from "express";
import * as webhookController from "./webhook.controller";

const router = Router();

// Endpoint configured in Cashfree Dashboard / orders API:
// POST /api/v1/webhooks/payment
router.post("/payment", webhookController.handleCashfreeWebhook);

// Also support alternate path: POST /api/v1/webhooks/cashfree
router.post("/cashfree", webhookController.handleCashfreeWebhook);

export default router;
