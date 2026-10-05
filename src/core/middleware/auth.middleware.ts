import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
      return;
    }

    const parts = authorization.trim().split(/\s+/);
    if (parts.length !== 2) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer <token>",
      });
      return;
    }

    const [scheme, token] = parts;
    if (scheme.toLowerCase() !== "bearer" || !token) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer <token>",
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId?: string;
      role?: string;
      email?: string;
      merchantId?: string;
    };

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role || "MERCHANT",
      email: decoded.email,
      merchantId: decoded.merchantId,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
      return;
    }

    next();
  };
}

export const authorizeAdmin = authorizeRole("ADMIN");
