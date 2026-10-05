import { z } from "zod";

/**
 * Refund Validation Schema
 */

export const createRefundSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid payment ID"),
  }),

  body: z.object({
    amount: z
      .number({
        message: "Refund amount must be a number",
      })
      .positive("Refund amount must be greater than zero")
      .finite("Refund amount must be a valid number")
      .refine(
        (value) => Number(value.toFixed(2)) === value,
        "Refund amount can have a maximum of 2 decimal places"
      ),

    reason: z
      .string()
      .trim()
      .max(500, "Refund reason is too long")
      .optional(),
  }),
});