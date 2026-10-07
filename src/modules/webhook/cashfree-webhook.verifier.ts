import { env } from "../../core/config/env";
import { verifyCashfreeWebhookSignature } from "../../core/utils/hmac";

export function verifyWebhookSignature(
  rawBody: Buffer | string,
  signature: string,
  timestamp: string
): boolean {
  // In test environment, use test secret; otherwise CASHFREE_WEBHOOK_SECRET or fallback to CASHFREE_CLIENT_SECRET
  const secret =
    process.env.NODE_ENV === "test"
      ? (env.CASHFREE_WEBHOOK_SECRET || "tiru-pay-webhook-secret")
      : (env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_CLIENT_SECRET || env.CASHFREE_PARTNER_API_KEY || "");

  if (!secret) {
    console.error(
      "[Webhook] Cannot verify Cashfree signature: neither CASHFREE_WEBHOOK_SECRET nor CASHFREE_CLIENT_SECRET is configured"
    );
    return false;
  }

  return verifyCashfreeWebhookSignature(rawBody, signature, timestamp, secret);
}
