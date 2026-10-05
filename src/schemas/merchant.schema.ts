import { z } from "zod";

/**
 * Merchant Onboarding Validation Schema
 */

export const onboardMerchantSchema = z.object({
  body: z.object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name must contain at least 2 characters")
      .max(150, "Business name is too long"),

    businessType: z
      .string()
      .trim()
      .min(2, "Business type must contain at least 2 characters")
      .max(100, "Business type is too long")
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
      .optional(),
  }),
});