import { z } from "zod";

export const submitKycSchema = z.object({
  // Company Identity (PAN)
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format (e.g. ABCDE1234F)")
    .optional(),
  panDocumentName: z.string().trim().optional(),
  pan_document_name: z.string().trim().optional(),
  panDocumentUrl: z.string().trim().optional(),
  pan_document_url: z.string().trim().optional(),

  // Identity Verification (Aadhaar / Passport / Driving Licence / Voter ID)
  identityDocType: z.string().trim().optional(),
  identity_doc_type: z.string().trim().optional(),
  identityDocNumber: z.string().trim().optional(),
  identity_doc_number: z.string().trim().optional(),
  identityDocumentName: z.string().trim().optional(),
  identity_document_name: z.string().trim().optional(),
  identityDocumentUrl: z.string().trim().optional(),
  identity_document_url: z.string().trim().optional(),

  // Company Documents
  numberOfDirectors: z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .optional(),
  number_of_directors: z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .optional(),
  directorsZipName: z.string().trim().optional(),
  directors_zip_name: z.string().trim().optional(),
  directorsZipUrl: z.string().trim().optional(),
  directors_zip_url: z.string().trim().optional(),
  incorporationDocumentName: z.string().trim().optional(),
  incorporation_document_name: z.string().trim().optional(),
  incorporationDocumentUrl: z.string().trim().optional(),
  incorporation_document_url: z.string().trim().optional(),

  // Provider overrides (e.g., MOCK_KYC)
  provider: z.string().trim().optional(),
  providerReference: z.string().trim().optional(),
});

export const verifyKycSchema = z.object({
  kycId: z.string().trim().min(1, "kycId is required"),
  decision: z.enum(["APPROVE", "REJECT"], {
    error: "Decision must be either APPROVE or REJECT",
  }),
  rejectionReason: z.string().trim().optional(),
});

export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type VerifyKycInput = z.infer<typeof verifyKycSchema>;
