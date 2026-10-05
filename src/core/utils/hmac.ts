import crypto from "crypto";

export function generateHmacSignature(
  payload: string | Buffer,
  secret: string
): string {
  if (!secret) {
    throw new Error("HMAC secret is required");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export function verifyHmacSignature(
  payload: string | Buffer,
  receivedSignature: string,
  secret: string
): boolean {
  if (!payload || !receivedSignature || !secret) {
    return false;
  }

  const expectedSignature = generateHmacSignature(payload, secret);
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(receivedSignature.trim(), "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

/**
 * Generate Cashfree webhook signature.
 * Cashfree signs: timestamp + raw request body using HMAC-SHA256 and returns Base64.
 */
export function generateCashfreeWebhookSignature(
  rawBody: string | Buffer,
  timestamp: string,
  secret: string
): string {
  if (!timestamp) {
    throw new Error("Cashfree webhook timestamp is required");
  }

  if (!secret) {
    throw new Error("Cashfree webhook secret is required");
  }

  const body = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(rawBody, "utf8");

  const signaturePayload = Buffer.concat([
    Buffer.from(timestamp, "utf8"),
    body,
  ]);

  return crypto
    .createHmac("sha256", secret)
    .update(signaturePayload)
    .digest("base64");
}

/**
 * Verify Cashfree webhook signature using timingSafeEqual.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string | Buffer,
  receivedSignature: string,
  timestamp: string,
  secret: string
): boolean {
  if (!rawBody || !receivedSignature || !timestamp || !secret) {
    return false;
  }

  const expectedSignature = generateCashfreeWebhookSignature(
    rawBody,
    timestamp,
    secret
  );

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(receivedSignature.trim(), "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}
