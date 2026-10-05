import { z } from "zod";

/**
 * Payout Validation Schemas
 *
 * Note:
 * Cashfree Payouts is handled separately from Cashfree Payments.
 * Keep these validations ready for the Payouts integration.
 */

export const createPayoutSchema = z.object({
  body: z.object({
    amount: z
      .number({
        message: "Payout amount must be a number",
      })
      .positive("Payout amount must be greater than zero")
      .finite("Payout amount must be a valid number")
      .refine(
        (value) => Number(value.toFixed(2)) === value,
        "Payout amount can have a maximum of 2 decimal places"
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

    beneficiaryId: z
      .string()
      .trim()
      .min(1, "Beneficiary ID is required")
      .max(100, "Beneficiary ID is too long")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Beneficiary ID may contain only letters, numbers, hyphens and underscores"
      ),

    metadata: z
      .record(z.string(), z.unknown())
      .optional(),
  }),
});

/**
 * Get Payout Validation Schema
 */

export const payoutIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid payout ID"),
  }),
});