import { z } from "zod";

/**
 * Authentication Validation Schemas
 */

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(100, "Password is too long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .max(100, "Password is too long"),
  }),
});