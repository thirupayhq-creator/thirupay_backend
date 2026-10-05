import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";
import { logger } from "../config/logger";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  /*
   * Prevent sending multiple responses
   */
  if (res.headersSent) {
    return;
  }

  /*
   * Safe error logging
   *
   * Do not log request body because it may contain:
   * - passwords
   * - JWT tokens
   * - payment information
   * - API credentials
   */
  if (error instanceof Error) {
    logger.error("API Error", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack:
        process.env.NODE_ENV !== "production"
          ? error.stack
          : undefined,
    });
  } else {
    logger.error("API Error", {
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }

  /*
   * Prisma known request errors
   */
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      /*
       * Unique constraint violation
       */
      case "P2002":
        res.status(409).json({
          success: false,
          message:
            "A record with this value already exists",
        });
        return;

      /*
       * Record not found
       */
      case "P2025":
        res.status(404).json({
          success: false,
          message: "Requested record was not found",
        });
        return;

      /*
       * Foreign key constraint failed
       */
      case "P2003":
        res.status(400).json({
          success: false,
          message:
            "Operation failed because a related record does not exist",
        });
        return;

      /*
       * Required relation violation
       */
      case "P2014":
        res.status(400).json({
          success: false,
          message:
            "The requested operation violates a required relationship",
        });
        return;

      /*
       * Transaction conflict
       */
      case "P2034":
        res.status(409).json({
          success: false,
          message:
            "Transaction conflict. Please try again",
        });
        return;

      default:
        res.status(400).json({
          success: false,
          message: "Database operation failed",
        });
        return;
    }
  }

  /*
   * Prisma validation errors
   */
  if (error instanceof PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: "Invalid database request",
    });
    return;
  }

  /*
   * Prisma database initialization errors
   */
  if (error instanceof PrismaClientInitializationError) {
    logger.error(
      "Prisma database initialization failed",
      error
    );

    res.status(503).json({
      success: false,
      message:
        "Database service is temporarily unavailable",
    });
    return;
  }

  /*
   * Zod validation errors
   */
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name?: string }).name === "ZodError"
  ) {
    const zodError = error as {
      errors?: unknown;
    };

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: zodError.errors,
    });
    return;
  }

  /*
   * JWT errors
   */
  if (
    error &&
    typeof error === "object" &&
    "name" in error
  ) {
    const errorName = (error as { name?: string }).name;

    if (errorName === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    if (errorName === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }
  }

  /*
   * Cashfree / external provider errors
   */
  if (error instanceof Error) {
    const normalizedMessage =
      error.message.toLowerCase();

    if (
      normalizedMessage.includes("cashfree") ||
      normalizedMessage.includes("payment provider") ||
      normalizedMessage.includes("payment gateway")
    ) {
      res.status(502).json({
        success: false,
        message:
          "Payment provider request failed",
      });
      return;
    }
  }

  /*
   * Application errors
   */
  if (error instanceof Error) {
    const message = error.message.trim();
    const normalizedMessage =
      message.toLowerCase();

    /*
     * Authentication errors
     */
    if (
      normalizedMessage.includes(
        "invalid email or password"
      ) ||
      normalizedMessage.includes(
        "invalid credentials"
      )
    ) {
      res.status(401).json({
        success: false,
        message,
      });
      return;
    }

    /*
     * Forbidden errors
     */
    if (
      normalizedMessage.includes("access denied") ||
      normalizedMessage.includes("forbidden") ||
      normalizedMessage.includes("not authorized")
    ) {
      res.status(403).json({
        success: false,
        message,
      });
      return;
    }

    /*
     * Conflict errors
     */
    if (
      normalizedMessage.includes(
        "already exists"
      ) ||
      normalizedMessage.includes(
        "already processed"
      ) ||
      normalizedMessage.includes(
        "already registered"
      ) ||
      normalizedMessage.includes(
        "duplicate"
      ) ||
      normalizedMessage.includes(
        "already submitted"
      )
    ) {
      res.status(409).json({
        success: false,
        message,
      });
      return;
    }

    /*
     * Not-found errors
     */
    if (
      normalizedMessage.includes("not found") ||
      normalizedMessage.includes(
        "does not exist"
      )
    ) {
      res.status(404).json({
        success: false,
        message,
      });
      return;
    }

    /*
     * Bad-request errors
     */
    const clientErrorKeywords = [
      "required",
      "must be",
      "invalid",
      "exceeds",
      "cannot",
      "is not",
      "not active",
      "unsupported",
      "amount",
      "currency",
      "refund",
      "kyc",
      "beneficiary",
      "idempotency",
    ];

    const isClientError =
      clientErrorKeywords.some((keyword) =>
        normalizedMessage.includes(keyword)
      );

    if (isClientError) {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }
  }

  /*
   * Unexpected server error
   *
   * Never expose internal error details in production.
   */
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};