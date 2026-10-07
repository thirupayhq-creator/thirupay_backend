import dotenv from "dotenv";
dotenv.config();

import * as authService from "../src/modules/auth/auth.service";
import prisma from "../src/core/config/database";

async function main() {
  const email = "shoppingmart@gmail.com";
  const password = "TestPassword123!"; // Also supports merchant123

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { merchant: true },
  });

  if (existing) {
    console.log("User already exists, updating status to ACTIVE...");
    if (existing.merchant) {
      await prisma.merchant.update({
        where: { id: existing.merchant.id },
        data: { status: "ACTIVE" },
      });
      console.log("Merchant status updated to ACTIVE!");
    }
    return;
  }

  console.log(`Creating merchant user '${email}' in PostgreSQL database...`);

  const result = await authService.register({
    name: "Shopping Mart Owner",
    ownerName: "Shopping Mart Owner",
    email,
    password,
    phone: "9876543211",
    businessName: "Shopping Mart",
    businessCategory: "Retail",
    entityType: "Private Limited",
    gst: "33ABCDE1234F1Z5",
    addressLine1: "123 Market Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    accountHolder: "Shopping Mart Owner",
    accountNumber: "98765432109999",
    ifsc: "HDFC0000240",
    bankName: "HDFC Bank",
    branch: "Chennai Main",
    kyc: {
      pan: "ABCDE1234F",
      panDocumentName: "pan_sample.pdf",
      panDocumentUrl: "https://tirupay.com/docs/pan.pdf",
      identityDocType: "aadhaar",
      identityDocNumber: "998877665544",
      identityDocumentName: "aadhaar_sample.pdf",
      identityDocumentUrl: "https://tirupay.com/docs/aadhaar.pdf",
      numberOfDirectors: 2,
      directorsZipName: "directors.zip",
      directorsZipUrl: "https://tirupay.com/docs/directors.zip",
      incorporationDocumentName: "incorp.pdf",
      incorporationDocumentUrl: "https://tirupay.com/docs/incorp.pdf",
      provider: "INTERNAL_PORTAL",
    },
  });

  console.log("✅ Successfully created user in PostgreSQL Neon DB:");
  console.log("  - User ID:     ", result.user.id);
  console.log("  - Email:       ", result.user.email);
  console.log("  - Merchant ID: ", result.merchant.id);
  console.log("  - Business:    ", result.merchant.businessName);
  console.log("  - Status:      ", result.merchant.status);
  console.log("  - Password set:", password);
}

main()
  .catch((e) => console.error("Error creating user:", e))
  .finally(() => prisma.$disconnect());
