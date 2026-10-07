import request from "supertest";
import { app } from "../src/app";
import prisma from "../src/core/config/database";
import { hashPassword } from "../src/core/utils/password";
import { generateToken } from "../src/core/utils/jwt";

describe("TIRU PAY - Merchant Creation & KYC Verification API", () => {
  const uniqueSuffix = Date.now();
  const merchantEmail = `merchant_${uniqueSuffix}@example.com`;
  const adminEmail = `admin_${uniqueSuffix}@example.com`;
  const password = "Password123";

  let merchantToken: string;
  let adminToken: string;
  let adminUserId: string;
  let merchantId: string;
  let kycId: string;

  beforeAll(async () => {
    // Create an Admin user for verification tests
    const passwordHash = await hashPassword(password);
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    adminUserId = adminUser.id;
    adminToken = generateToken({
      userId: adminUser.id,
      role: "ADMIN",
      email: adminUser.email,
    });
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.kycVerification.deleteMany({
      where: {
        merchant: {
          user: {
            email: { in: [merchantEmail, adminEmail] },
          },
        },
      },
    });
    await prisma.merchant.deleteMany({
      where: {
        user: {
          email: { in: [merchantEmail, adminEmail] },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [merchantEmail, adminEmail] },
      },
    });
  });

  describe("1. Merchant Creation (Registration with Business & Bank Details)", () => {
    it("should register a new merchant with complete business and bank profile", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Selvi Kumar",
          ownerName: "Selvi Kumar",
          email: merchantEmail,
          password,
          phone: "9876543210",
          businessName: "Selvi Enterprises",
          businessCategory: "Retail",
          entityType: "Private Limited",
          gst: "33AAAAA0000A1Z5",
          addressLine1: "123 Main St",
          addressLine2: "Suite 4B",
          pincode: "600001",
          city: "Chennai",
          state: "Tamil Nadu",
          accountHolder: "Selvi Kumar",
          accountNumber: "123456789012",
          ifsc: "HDFC0001234",
          bankName: "HDFC Bank",
          branch: "Anna Nagar",
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(merchantEmail);
      expect(response.body.data.merchant.businessName).toBe("Selvi Enterprises");
      expect(response.body.data.token).toBeDefined();

      merchantToken = response.body.data.token;
      merchantId = response.body.data.merchant.id;
    });

    it("should fetch the newly created merchant profile with all business details", async () => {
      const response = await request(app)
        .get("/api/v1/merchants/me")
        .set("Authorization", `Bearer ${merchantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.businessName).toBe("Selvi Enterprises");
      expect(response.body.data.ownerName).toBe("Selvi Kumar");
      expect(response.body.data.bankName).toBe("HDFC Bank");
      expect(response.body.data.ifsc).toBe("HDFC0001234");
      expect(response.body.data.status).toBe("PENDING");
    });
  });

  describe("2. KYC Submission from Frontend", () => {
    it("should submit full KYC verification documentation", async () => {
      const response = await request(app)
        .post("/api/v1/kyc/submit")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          pan: "ABCDE1234F",
          panDocumentName: "pan_card.pdf",
          panDocumentUrl: "data:application/pdf;base64,JVBERi0xLjQK...",
          identityDocType: "aadhaar",
          identityDocNumber: "123456789012",
          identityDocumentName: "aadhaar_front_back.pdf",
          identityDocumentUrl: "data:application/pdf;base64,JVBERi0xLjQK...",
          numberOfDirectors: 2,
          directorsZipName: "directors_list.zip",
          directorsZipUrl: "data:application/zip;base64,UEsDBBQAAAAIA...",
          incorporationDocumentName: "incorporation_certificate.pdf",
          incorporationDocumentUrl: "data:application/pdf;base64,JVBERi0xLjQK...",
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("SUBMITTED");
      expect(response.body.data.pan).toBe("ABCDE1234F");
      expect(response.body.data.identityDocType).toBe("aadhaar");
      expect(response.body.data.numberOfDirectors).toBe(2);

      kycId = response.body.data.id;
    });

    it("should return KYC status for the authenticated merchant", async () => {
      const response = await request(app)
        .get("/api/v1/kyc/status")
        .set("Authorization", `Bearer ${merchantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.merchantStatus).toBe("PENDING");
      expect(response.body.data.kyc.status).toBe("SUBMITTED");
      expect(response.body.data.kyc.pan).toBe("ABCDE1234F");
      expect(response.body.data.kyc.panDocumentName).toBe("pan_card.pdf");
    });
  });

  describe("3. Admin KYC Verification Workflow", () => {
    it("should list pending KYC submissions for Admin", async () => {
      const response = await request(app)
        .get("/api/v1/kyc/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const found = response.body.data.find(
        (item: any) => item.id === kycId
      );
      expect(found).toBeDefined();
      expect(found.merchant.businessName).toBe("Selvi Enterprises");
      expect(found.pan).toBe("ABCDE1234F");
    });

    it("should get specific KYC document details by ID for Admin", async () => {
      const response = await request(app)
        .get(`/api/v1/kyc/${kycId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(kycId);
      expect(response.body.data.pan).toBe("ABCDE1234F");
      expect(response.body.data.incorporationDocumentName).toBe(
        "incorporation_certificate.pdf"
      );
    });

    it("should allow Admin to APPROVE the KYC verification and activate merchant", async () => {
      const response = await request(app)
        .post("/api/v1/kyc/verify")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          kycId,
          decision: "APPROVE",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("VERIFIED");
      expect(response.body.data.verifiedAt).toBeDefined();

      // Check merchant status is now ACTIVE
      const merchantCheck = await prisma.merchant.findUnique({
        where: { id: merchantId },
      });
      expect(merchantCheck?.status).toBe("ACTIVE");
    });
  });
});
