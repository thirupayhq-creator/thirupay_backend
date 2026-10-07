import { Router } from "express";
import * as authController from "./auth.controller";
import { validateBody } from "../../core/middleware/validation.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { authenticate } from "../../core/middleware/auth.middleware";
import { authRateLimiter } from "../../core/middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register
);

router.post(
  "/register-merchant",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register
);


router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);

router.get("/me", authenticate, authController.getMe);

export default router;
