import prisma from "../../core/config/database";
import { KycStatus } from "@prisma/client";
import { SubmitKycInput } from "./kyc.schema";
import { logger } from "../../core/config/logger";
import { cashfreePartnerService } from "../merchant/cashfree-partner.service";

export async function submitKyc(userId: string, input: SubmitKycInput) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: { kyc: true },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.kyc && merchant.kyc.status === "SUBMITTED") {
    throw new Error("KYC is already submitted and awaiting verification");
  }

  if (merchant.kyc && merchant.kyc.status === "VERIFIED") {
    throw new Error("KYC is already verified");
  }

  // Normalized fields supporting camelCase and snake_case
  const pan = input.pan ? input.pan.trim().toUpperCase() : merchant.kyc?.pan || null;
  const panDocumentName = input.panDocumentName || input.pan_document_name || merchant.kyc?.panDocumentName || null;
  const panDocumentUrl = input.panDocumentUrl || input.pan_document_url || merchant.kyc?.panDocumentUrl || null;

  const identityDocType = input.identityDocType || input.identity_doc_type || merchant.kyc?.identityDocType || null;
  const identityDocNumber = input.identityDocNumber || input.identity_doc_number || merchant.kyc?.identityDocNumber || null;
  const identityDocumentName = input.identityDocumentName || input.identity_document_name || merchant.kyc?.identityDocumentName || null;
  const identityDocumentUrl = input.identityDocumentUrl || input.identity_document_url || merchant.kyc?.identityDocumentUrl || null;

  const numberOfDirectors = input.numberOfDirectors ?? input.number_of_directors ?? merchant.kyc?.numberOfDirectors ?? null;
  const directorsZipName = input.directorsZipName || input.directors_zip_name || merchant.kyc?.directorsZipName || null;
  const directorsZipUrl = input.directorsZipUrl || input.directors_zip_url || merchant.kyc?.directorsZipUrl || null;

  const incorporationDocumentName = input.incorporationDocumentName || input.incorporation_document_name || merchant.kyc?.incorporationDocumentName || null;
  const incorporationDocumentUrl = input.incorporationDocumentUrl || input.incorporation_document_url || merchant.kyc?.incorporationDocumentUrl || null;

  const isAutoApproved = input.provider === "MOCK_AUTO_APPROVE" || (process.env.NODE_ENV === "test" && input.provider === "MOCK_KYC");
  const kycStatus: KycStatus = isAutoApproved ? "VERIFIED" : "SUBMITTED";

  const kycId = merchant.kyc?.id || `kyc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const kyc = await prisma.kycVerification.upsert({
    where: { merchantId: merchant.id },
    create: {
      id: kycId,
      merchantId: merchant.id,
      status: kycStatus,
      provider: input.provider || "INTERNAL_PORTAL",
      providerReference: input.providerReference || `ref_${Date.now()}`,
      submittedAt: new Date(),
      verifiedAt: isAutoApproved ? new Date() : null,
      pan,
      panDocumentName,
      panDocumentUrl,
      identityDocType,
      identityDocNumber,
      identityDocumentName,
      identityDocumentUrl,
      numberOfDirectors,
      directorsZipName,
      directorsZipUrl,
      incorporationDocumentName,
      incorporationDocumentUrl,
    },
    update: {
      status: kycStatus,
      provider: input.provider || merchant.kyc?.provider || "INTERNAL_PORTAL",
      providerReference: input.providerReference || merchant.kyc?.providerReference || `ref_${Date.now()}`,
      submittedAt: new Date(),
      verifiedAt: isAutoApproved ? new Date() : null,
      rejectionReason: null,
      rejectedAt: null,
      pan,
      panDocumentName,
      panDocumentUrl,
      identityDocType,
      identityDocNumber,
      identityDocumentName,
      identityDocumentUrl,
      numberOfDirectors,
      directorsZipName,
      directorsZipUrl,
      incorporationDocumentName,
      incorporationDocumentUrl,
    },
  });

  if (isAutoApproved) {
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { status: "ACTIVE" },
    });
  }

  return kyc;
}

export async function getKycStatus(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: {
      kyc: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  return {
    merchantId: merchant.id,
    businessName: merchant.businessName,
    ownerName: merchant.ownerName || merchant.user?.name,
    phone: merchant.phone,
    merchantStatus: merchant.status,
    kyc: merchant.kyc,
  };
}

export async function getKycById(kycId: string) {
  const kyc = await prisma.kycVerification.findUnique({
    where: { id: kycId },
    include: {
      merchant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!kyc) {
    throw new Error("KYC verification record not found");
  }

  return kyc;
}

export async function listPendingKyc(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.kycVerification.findMany({
      where: { status: "SUBMITTED" },
      skip,
      take: limit,
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            businessCategory: true,
            entityType: true,
            ownerName: true,
            phone: true,
            gst: true,
            accountHolder: true,
            accountNumber: true,
            ifsc: true,
            bankName: true,
            branch: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.kycVerification.count({ where: { status: "SUBMITTED" } }),
  ]);

  return { items, total, page, limit };
}

export async function listAllKyc(page = 1, limit = 20, status?: KycStatus) {
  const skip = (page - 1) * limit;
  const whereClause = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.kycVerification.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            businessCategory: true,
            entityType: true,
            ownerName: true,
            phone: true,
            gst: true,
            status: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.kycVerification.count({ where: whereClause }),
  ]);

  return { items, total, page, limit };
}

export async function verifyKyc(
  kycId: string,
  decision: "APPROVE" | "REJECT",
  rejectionReason?: string
) {
  const kyc = await prisma.kycVerification.findUnique({
    where: { id: kycId },
    include: {
      merchant: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!kyc) {
    throw new Error("KYC verification record not found");
  }

  const isApproved = decision === "APPROVE";

  const updatedKyc = await prisma.$transaction(async (tx) => {
    const updated = await tx.kycVerification.update({
      where: { id: kycId },
      data: {
        status: isApproved ? "VERIFIED" : "REJECTED",
        verifiedAt: isApproved ? new Date() : null,
        rejectedAt: !isApproved ? new Date() : null,
        rejectionReason: !isApproved ? rejectionReason || "Rejected by admin" : null,
      },
    });

    await tx.merchant.update({
      where: { id: kyc.merchantId },
      data: {
        status: isApproved ? "ACTIVE" : "REJECTED",
      },
    });

    return updated;
  });

  // Option A: Automatically onboard / create sub-merchant in Cashfree Partner sandbox
  if (isApproved && kyc.merchant) {
    try {
      logger.info(`Onboarding merchant to Cashfree Partner platform [${kyc.merchantId}]`);
      const cfResponse = await cashfreePartnerService.createMerchant({
        merchantId: kyc.merchantId,
        merchantName: kyc.merchant.businessName,
        merchantEmail: kyc.merchant.user?.email || "merchant@tirupay.com",
        pocPhone: kyc.merchant.phone || "9999999999",
        merchantSiteUrl: "https://tirupay.com",
        businessDetails: {
          businessLegalName: kyc.merchant.businessName,
          businessType: kyc.merchant.businessType || undefined,
          businessPan: kyc.pan || undefined,
          businessGstin: kyc.merchant.gst || undefined,
        },
      });

      logger.info(`Successfully onboarded sub-merchant in Cashfree [${kyc.merchantId}]`, { cfResponse });

      await prisma.merchant.update({
        where: { id: kyc.merchantId },
        data: {
          cashfreeMerchantId: cfResponse.merchant_id || kyc.merchantId,
          cashfreeStatus: (cfResponse.onboarding_status as string) || (cfResponse.account_status as string) || "CREATED",
        },
      });
    } catch (cfErr: any) {
      logger.warn(`Cashfree sub-merchant creation error for [${kyc.merchantId}]: ${cfErr.message}`);
    }
  }

  return updatedKyc;
}

