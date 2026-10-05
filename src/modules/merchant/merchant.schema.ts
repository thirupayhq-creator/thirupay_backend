import { z } from "zod";

export const onboardMerchantSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export const updateMerchantStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"], {
    error: "Invalid merchant status",
  }),
});

export type OnboardMerchantInput = z.infer<typeof onboardMerchantSchema>;
export type UpdateMerchantStatusInput = z.infer<typeof updateMerchantStatusSchema>;
