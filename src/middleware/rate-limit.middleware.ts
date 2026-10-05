import rateLimit from "express-rate-limit";
import { Request } from "express";

/*
 * Shared rate-limit response
 */
const rateLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

/*
 * General API rate limiter
 *
 * Protects TIRU PAY APIs from:
 * - Excessive requests
 * - Brute-force traffic
 * - Accidental traffic spikes
 * - Basic denial-of-service attempts
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: rateLimitResponse,

  keyGenerator: (req: Request): string => {
    return req.ip || "unknown";
  },

  skip: (req: Request): boolean => {
    return (
      req.path === "/health" ||
      req.path === "/api/v1/webhooks/payment"
    );
  },

  handler: (_req, res): void => {
    res.status(429).json({
      success: false,
      message:
        "Too many requests. Please try again later.",
    });
  },
});

/*
 * Strict authentication rate limiter
 *
 * Recommended for:
 * - Login
 * - Register
 *
 * Helps reduce brute-force attacks against
 * authentication endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },

  keyGenerator: (req: Request): string => {
    return req.ip || "unknown";
  },

  handler: (_req, res): void => {
    res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    });
  },
});

/*
 * Payment rate limiter
 *
 * Payment creation is more sensitive.
 *
 * Limit:
 * 30 requests per minute per authenticated user.
 *
 * Falls back to IP address when the user is
 * not authenticated.
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Payment request limit exceeded. Please try again later.",
  },

  keyGenerator: (req: Request): string => {
    const userId = req.user?.userId;

    if (userId) {
      return `user:${userId}`;
    }

    return `ip:${req.ip || "unknown"}`;
  },

  handler: (_req, res): void => {
    res.status(429).json({
      success: false,
      message:
        "Payment request limit exceeded. Please try again later.",
    });
  },
});

/*
 * Webhook rate limiter
 *
 * Cashfree webhooks should not be blocked by the
 * general API limiter. This limiter provides a
 * separate protection layer.
 */
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many webhook requests. Please try again later.",
  },

  keyGenerator: (req: Request): string => {
    return `webhook:${req.ip || "unknown"}`;
  },

  handler: (_req, res): void => {
    res.status(429).json({
      success: false,
      message:
        "Too many webhook requests. Please try again later.",
    });
  },
});