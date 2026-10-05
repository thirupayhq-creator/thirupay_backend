import prisma from "../config/database";

interface SubmitKycInput {
  merchantId: string;
  provider?: string;
  providerReference?: string;
}

/**
 * Submit or resubmit merchant KYC
 */
export async function submitKyc(input: SubmitKycInput) {
  const merchantId = input.merchantId?.trim();
  const provider = input.provider?.trim() || "MOCK_KYC";
  const providerReference =
    input.providerReference?.trim() || undefined;

  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status === "SUSPENDED") {
    throw new Error("Merchant account is suspended");
  }

  const kyc = await prisma.kycVerification.upsert({
    where: {
      merchantId,
    },

    create: {
      id: crypto.randomUUID(),
      merchantId,
      provider,
      providerReference,
      status: "SUBMITTED",
      submittedAt: new Date(),
      verifiedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    },

    update: {
      provider,
      providerReference,
      status: "SUBMITTED",
      submittedAt: new Date(),
      verifiedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    },
  });

  return kyc;
}

/**
 * Get merchant KYC status
 */
export async function getKycStatus(merchantId: string) {
  const normalizedMerchantId = merchantId?.trim();

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const kyc = await prisma.kycVerification.findUnique({
    where: {
      merchantId: normalizedMerchantId,
    },
  });

  if (!kyc) {
    throw new Error("KYC application not found");
  }

  return kyc;
}

/**
 * Verify merchant KYC
 */
export async function verifyKyc(
  merchantId: string,
  providerReference?: string
) {
  const normalizedMerchantId = merchantId?.trim();

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const kyc = await prisma.kycVerification.findUnique({
    where: {
      merchantId: normalizedMerchantId,
    },
  });

  if (!kyc) {
    throw new Error("KYC application not found");
  }

  if (kyc.status === "VERIFIED") {
    return kyc;
  }

  const updatedKyc = await prisma.$transaction(async (tx) => {
    const updated = await tx.kycVerification.update({
      where: {
        merchantId: normalizedMerchantId,
      },

      data: {
        status: "VERIFIED",
        providerReference:
          providerReference?.trim() || kyc.providerReference,
        verifiedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    await tx.merchant.update({
      where: {
        id: normalizedMerchantId,
      },

      data: {
        status: "ACTIVE",
      },
    });

    return updated;
  });

  return updatedKyc;
}

/**
 * Reject merchant KYC
 */
export async function rejectKyc(
  merchantId: string,
  reason: string
) {
  const normalizedMerchantId = merchantId?.trim();
  const normalizedReason = reason?.trim();

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!normalizedReason) {
    throw new Error("KYC rejection reason is required");
  }

  if (normalizedReason.length > 500) {
    throw new Error("KYC rejection reason is too long");
  }

  const kyc = await prisma.kycVerification.findUnique({
    where: {
      merchantId: normalizedMerchantId,
    },
  });

  if (!kyc) {
    throw new Error("KYC application not found");
  }

  const updatedKyc = await prisma.kycVerification.update({
    where: {
      merchantId: normalizedMerchantId,
    },

    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectionReason: normalizedReason,
      verifiedAt: null,
    },
  });

  // A rejected KYC must not leave the merchant ACTIVE.
  await prisma.merchant.update({
    where: {
      id: normalizedMerchantId,
    },

    data: {
      status: "REJECTED",
    },
  });

  return updatedKyc;
}