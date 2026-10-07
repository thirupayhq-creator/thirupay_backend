import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  ownerName: z.string().trim().optional(),
  owner_name: z.string().trim().optional(),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  phone: z.string().trim().optional(),
  phoneVerified: z.boolean().optional(),

  // Business profile
  businessName: z.string().trim().optional(),
  businessType: z.string().trim().optional(),
  businessCategory: z.string().trim().optional(),
  business_category: z.string().trim().optional(),
  entityType: z.string().trim().optional(),
  entity_type: z.string().trim().optional(),
  gst: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  address_line1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  address_line2: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  businessPhoto: z.string().trim().optional(),
  business_photo: z.string().trim().optional(),

  // Bank details
  accountHolder: z.string().trim().optional(),
  account_holder: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  account_number: z.string().trim().optional(),
  confirmAccountNumber: z.string().trim().optional(),
  ifsc: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bank_name: z.string().trim().optional(),
  branch: z.string().trim().optional(),

  // Optional KYC verification details
  kyc: z
    .object({
      pan: z.string().trim().optional(),
      panDocumentName: z.string().trim().optional(),
      pan_document_name: z.string().trim().optional(),
      panDocumentUrl: z.string().trim().optional(),
      pan_document_url: z.string().trim().optional(),
      identityDocType: z.string().trim().optional(),
      identity_doc_type: z.string().trim().optional(),
      identityDocNumber: z.string().trim().optional(),
      identity_doc_number: z.string().trim().optional(),
      identityDocumentName: z.string().trim().optional(),
      identity_document_name: z.string().trim().optional(),
      identityDocumentUrl: z.string().trim().optional(),
      identity_document_url: z.string().trim().optional(),
      numberOfDirectors: z.union([z.number(), z.string().transform(Number)]).optional(),
      number_of_directors: z.union([z.number(), z.string().transform(Number)]).optional(),
      directorsZipName: z.string().trim().optional(),
      directors_zip_name: z.string().trim().optional(),
      directorsZipUrl: z.string().trim().optional(),
      directors_zip_url: z.string().trim().optional(),
      incorporationDocumentName: z.string().trim().optional(),
      incorporation_document_name: z.string().trim().optional(),
      incorporationDocumentUrl: z.string().trim().optional(),
      incorporation_document_url: z.string().trim().optional(),
      provider: z.string().trim().optional(),
    })
    .optional(),
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
