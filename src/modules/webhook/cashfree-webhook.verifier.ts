import { env } from "../../core/config/env";
import { verifyCashfreeWebhookSignature } from "../../core/utils/hmac";

export function verifyWebhookSignature(
  rawBody: Buffer | string,
  signature: string,
  timestamp: string
): boolean {
  // Cashfree uses CASHFREE_WEBHOOK_SECRET, or fallback to CASHFREE_CLIENT_SECRET
  const secret =
    env.CASHFREE_WEBHOOK_SECRET ||
    env.CASHFREE_CLIENT_SECRET ||
    (process.env.NODE_ENV === "test" ? "tiru-pay-webhook-secret" : "");

  if (!secret) {
    console.error(
      "[Webhook] Cannot verify Cashfree signature: neither CASHFREE_WEBHOOK_SECRET nor CASHFREE_CLIENT_SECRET is configured"
    );
    return false;
  }

  return verifyCashfreeWebhookSignature(rawBody, signature, timestamp, secret);
}
