import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { logger } from "../config/logger";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const result = await registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    logger.info("User registered successfully", {
      userId: result.user.id,
      email: result.user.email,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token: result.token,
        user: result.user,
        merchant: result.merchant,
      },
    });
  } catch (error) {
    logger.error("User registration failed", error);
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    const result = await loginUser({
      email: email.trim().toLowerCase(),
      password,
    });

    logger.info("User logged in successfully", {
      userId: result.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user,
        merchant: result.merchant,
      },
    });
  } catch (error) {
    logger.error("User login failed", error);
    next(error);
  }
}