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
import { ZodError } from "zod";
import { logger } from "../config/logger";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (res.headersSent) {
    return;
  }

  // Log error safely without sensitive headers/body
  if (error instanceof Error) {
    logger.error("API Error", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  } else {
    logger.error("API Error", {
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }

  // Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }

  // Prisma Errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        res.status(409).json({
          success: false,
          message: "A record with this value already exists",
        });
        return;

      case "P2025":
        res.status(404).json({
          success: false,
          message: "Requested record was not found",
        });
        return;

      case "P2003":
        res.status(400).json({
          success: false,
          message: "Operation failed because a related record does not exist",
        });
        return;

      case "P2014":
        res.status(400).json({
          success: false,
          message: "The requested operation violates a required relationship",
        });
        return;

      default:
        res.status(400).json({
          success: false,
          message: "Database request error",
        });
        return;
    }
  }

  if (error instanceof PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: "Invalid database query payload",
    });
    return;
  }

  if (error instanceof PrismaClientInitializationError) {
    logger.error("Database connection failure", error.message);
    res.status(503).json({
      success: false,
      message: "Database is unavailable. Please check your connection.",
    });
    return;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for common client errors
    if (
      error.message.includes("not found") ||
      error.message.includes("Not found")
    ) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error.message.includes("Invalid email or password") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("unauthorized")
    ) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error.message.includes("already exists") ||
      error.message.includes("already registered")
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message || "An unexpected error occurred",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
