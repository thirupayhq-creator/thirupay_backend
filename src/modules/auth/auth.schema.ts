import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  businessName: z.string().trim().min(2).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z.string({ error: "Password is required" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
