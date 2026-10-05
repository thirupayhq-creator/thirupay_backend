import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { successResponse } from "../../core/utils/response";
import { logger } from "../../core/config/logger";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    logger.info("User registered successfully", { userId: result.user.id });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    logger.info("User logged in successfully", { userId: result.user.id });
    successResponse(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await authService.getMe(userId);
    successResponse(res, user, "User profile fetched successfully");
  } catch (error) {
    next(error);
  }
}
