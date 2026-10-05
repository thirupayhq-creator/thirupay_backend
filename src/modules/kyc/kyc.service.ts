import prisma from "../../core/config/database";
import { KycStatus } from "@prisma/client";

export interface SubmitKycInput {
  provider?: string;
  providerReference?: string;
}

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

  const isAutoApproved = input.provider === "MOCK_KYC" || process.env.NODE_ENV === "test";
  const kycStatus: KycStatus = isAutoApproved ? "VERIFIED" : "SUBMITTED";

  const kycId = merchant.kyc?.id || `kyc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const kyc = await prisma.kycVerification.upsert({
    where: { merchantId: merchant.id },
    create: {
      id: kycId,
      merchantId: merchant.id,
      status: kycStatus,
      provider: input.provider || "MOCK_KYC",
      providerReference: input.providerReference || `ref_${Date.now()}`,
      submittedAt: new Date(),
      verifiedAt: isAutoApproved ? new Date() : null,
    },
    update: {
      status: kycStatus,
      provider: input.provider || merchant.kyc?.provider,
      providerReference: input.providerReference || merchant.kyc?.providerReference,
      submittedAt: new Date(),
      verifiedAt: isAutoApproved ? new Date() : null,
      rejectionReason: null,
      rejectedAt: null,
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
    include: { kyc: true },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  return {
    merchantId: merchant.id,
    businessName: merchant.businessName,
    merchantStatus: merchant.status,
    kyc: merchant.kyc,
  };
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
            phone: true,
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

export async function verifyKyc(
  kycId: string,
  decision: "APPROVE" | "REJECT",
  rejectionReason?: string
) {
  const kyc = await prisma.kycVerification.findUnique({
    where: { id: kycId },
    include: { merchant: true },
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

  return updatedKyc;
}
