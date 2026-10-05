import { Request, Response, NextFunction } from "express";
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthUser {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Authenticate user using JWT Bearer token
 */
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
        message:
          "Invalid authorization format. Use Bearer <token>",
      });
      return;
    }

    const [scheme, token] = parts;

    if (scheme.toLowerCase() !== "bearer" || !token) {
      res.status(401).json({
        success: false,
        message:
          "Invalid authorization format. Use Bearer <token>",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET || env.jwtSecret
    ) as JwtPayload;

    const userId = decoded.userId;
    const role = decoded.role;

    if (
      typeof userId !== "string" ||
      userId.trim().length === 0
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload: userId is missing",
      });
      return;
    }

    if (
      typeof role !== "string" ||
      role.trim().length === 0
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload: role is missing",
      });
      return;
    }

    req.user = {
      userId,
      role,
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
        message: "Invalid or malformed token",
      });
      return;
    }

    next(error);
  }
}

/**
 * Authorize user based on role
 */
export function authorizeRoles(
  ...allowedRoles: string[]
) {
  const normalizedRoles = allowedRoles.map((role) =>
    role.trim().toUpperCase()
  );

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userRole = req.user.role
      .trim()
      .toUpperCase();

    if (!normalizedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Access denied",
        data: {
          requiredRoles: normalizedRoles,
          currentRole: userRole,
        },
      });
      return;
    }

    next();
  };
}