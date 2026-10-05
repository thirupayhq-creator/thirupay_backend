import { z } from "zod";

export const createRefundSchema = z.object({
  amount: z
    .number({ error: "Refund amount is required" })
    .positive("Refund amount must be greater than zero")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Refund amount can have a maximum of 2 decimal places",
    }),
  reason: z.string().trim().max(255).optional(),
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
