import { z } from "zod";

export const onboardMerchantSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().trim().optional(),
  phone: z.string().trim().optional(),

  // Profile and Category
  ownerName: z.string().trim().optional(),
  owner_name: z.string().trim().optional(),
  businessCategory: z.string().trim().optional(),
  business_category: z.string().trim().optional(),
  entityType: z.string().trim().optional(),
  entity_type: z.string().trim().optional(),
  gst: z.string().trim().optional(),

  // Address
  addressLine1: z.string().trim().optional(),
  address_line1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  address_line2: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  businessPhoto: z.string().trim().optional(),
  business_photo: z.string().trim().optional(),

  // Bank Account
  accountHolder: z.string().trim().optional(),
  account_holder: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  account_number: z.string().trim().optional(),
  confirmAccountNumber: z.string().trim().optional(),
  ifsc: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bank_name: z.string().trim().optional(),
  branch: z.string().trim().optional(),
});

export const updateMerchantStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"], {
    error: "Invalid merchant status",
  }),
});

export type OnboardMerchantInput = z.infer<typeof onboardMerchantSchema>;
export type UpdateMerchantStatusInput = z.infer<typeof updateMerchantStatusSchema>;

