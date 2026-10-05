import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z
    .string({ error: "orderId is required" })
    .trim()
    .min(1, "orderId cannot be empty")
    .max(100, "orderId is too long"),
  amount: z
    .number({ error: "amount must be a number" })
    .positive("amount must be greater than zero")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "amount can have a maximum of 2 decimal places",
    }),
  currency: z.enum(["INR"], { error: "Unsupported currency. Only INR is supported" }).default("INR"),
  paymentMethod: z
    .enum(["UPI", "CARD", "NET_BANKING", "NETBANKING", "WALLET", "OTHER"])
    .optional(),
  description: z.string().trim().max(255).optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  // Customer Details (for Cashfree PG)
  customerId: z.string().trim().optional(),
  customerName: z.string().trim().optional(),
  customerEmail: z.string().trim().email("Invalid customer email").optional(),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian phone number")
    .optional(),
  returnUrl: z.string().url("Invalid return URL").optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
