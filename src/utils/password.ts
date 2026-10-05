import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 *
 * Passwords should never be stored directly.
 */
export async function hashPassword(
  password: string
): Promise<string> {
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (password.length < 8) {
    throw new Error(
      "Password must contain at least 8 characters"
    );
  }

  if (password.length > 100) {
    throw new Error(
      "Password must not exceed 100 characters"
    );
  }

  return bcrypt.hash(
    password,
    SALT_ROUNDS
  );
}

/**
 * Compare a plain-text password with a bcrypt hash.
 *
 * Returns false instead of exposing hashing errors
 * to the authentication layer.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (
    typeof password !== "string" ||
    typeof hashedPassword !== "string"
  ) {
    return false;
  }

  if (!password || !hashedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(
      password,
      hashedPassword
    );
  } catch {
    return false;
  }
}