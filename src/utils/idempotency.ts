import crypto from "crypto";

/**
 * Generate a secure idempotency key.
 *
 * UUID v4 provides a cryptographically strong,
 * practically unique identifier for payment requests.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Validate an idempotency key.
 *
 * Rules:
 * - Required
 * - Trimmed value must be 8–255 characters
 * - No control characters
 */
export function isValidIdempotencyKey(
  key: string | undefined
): boolean {
  if (typeof key !== "string") {
    return false;
  }

  const trimmedKey = key.trim();

  if (
    trimmedKey.length < 8 ||
    trimmedKey.length > 255
  ) {
    return false;
  }

  // Reject control characters that could cause
  // logging/header/storage problems.
  if (/[\u0000-\u001F\u007F]/.test(trimmedKey)) {
    return false;
  }

  return true;
}

/**
 * Normalize an idempotency key before storing or
 * comparing it.
 */
export function normalizeIdempotencyKey(
  key: string
): string {
  if (typeof key !== "string") {
    throw new Error(
      "Idempotency key must be a string"
    );
  }

  const normalizedKey = key.trim();

  if (!isValidIdempotencyKey(normalizedKey)) {
    throw new Error(
      "Invalid idempotency key"
    );
  }

  return normalizedKey;
}