import { z } from "zod";

export const createPayoutSchema = z.object({
  amount: z
    .number({ error: "Payout amount is required" })
    .positive("Payout amount must be greater than zero")
    .refine((val) => Number.isInteger(Math.round(val * 100)), {
      message: "Payout amount can have a maximum of 2 decimal places",
    }),
  currency: z.string().trim().default("INR"),
  beneficiaryId: z.string({ error: "beneficiaryId is required" }).trim().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
