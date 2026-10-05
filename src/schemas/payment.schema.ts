import { z } from "zod";

/**
 * Payment Validation Schemas
 *
 * Cashfree currently supports INR payments for this TIRU PAY setup.
 */

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z
      .string()
      .trim()
      .min(1, "Order ID is required")
      .max(100, "Order ID is too long")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Order ID may contain only letters, numbers, hyphens and underscores"
      ),

    amount: z
      .number({
        message: "Amount must be a number",
      })
      .positive("Amount must be greater than zero")
      .finite("Amount must be a valid number")
      .refine(
        (value) => Number(value.toFixed(2)) === value,
        "Amount can have a maximum of 2 decimal places"
      ),

    currency: z
      .string()
      .trim()
      .length(3, "Currency must be a 3-letter code")
      .toUpperCase()
      .default("INR")
      .refine(
        (value) => value === "INR",
        "Only INR currency is supported"
      ),

    paymentMethod: z
      .enum([
        "UPI",
        "CARD",
        "NET_BANKING",
        "WALLET",
        "OTHER",
      ])
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description is too long")
      .optional(),

    metadata: z
      .record(z.string(), z.unknown())
      .optional(),
  }),
});

/**
 * Get Payment
 */

export const paymentIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid payment ID"),
  }),
});

/**
 * Verify Payment
 */

export const verifyPaymentSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid payment ID"),
  }),
});