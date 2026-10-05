import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller";

const router = Router();

/**
 * Authentication Routes
 */

// Register a new user
router.post("/register", register);

// Login existing user
router.post("/login", login);

export default router;