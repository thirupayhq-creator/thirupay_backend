import crypto from "crypto";

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function isValidIdempotencyKey(key: string | undefined): boolean {
  if (typeof key !== "string") {
    return false;
  }

  const trimmedKey = key.trim();
  if (trimmedKey.length < 8 || trimmedKey.length > 255) {
    return false;
  }

  if (/[\u0000-\u001F\u007F]/.test(trimmedKey)) {
    return false;
  }

  return true;
}

export function normalizeIdempotencyKey(key: string): string {
  if (typeof key !== "string") {
    throw new Error("Idempotency key must be a string");
  }

  const normalizedKey = key.trim();
  if (!isValidIdempotencyKey(normalizedKey)) {
    throw new Error("Invalid idempotency key");
  }

  return normalizedKey;
}
