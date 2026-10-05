import prisma from "../config/database";

interface OnboardMerchantInput {
  userId: string;
  businessName: string;
  businessType?: string;
  phone?: string;
}

/**
 * Create or update merchant onboarding details
 */
export async function onboardMerchant(
  input: OnboardMerchantInput
) {
  const userId = input.userId?.trim();
  const businessName = input.businessName?.trim();
  const businessType = input.businessType?.trim() || undefined;
  const phone = input.phone?.trim() || undefined;

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!businessName) {
    throw new Error("Business name is required");
  }

  if (businessName.length < 2) {
    throw new Error(
      "Business name must contain at least 2 characters"
    );
  }

  if (businessName.length > 150) {
    throw new Error("Business name is too long");
  }

  if (businessType && businessType.length > 100) {
    throw new Error("Business type is too long");
  }

  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Invalid Indian phone number");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      userId,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status === "SUSPENDED") {
    throw new Error("Merchant account is suspended");
  }

  const updatedMerchant = await prisma.merchant.update({
    where: {
      id: merchant.id,
    },
    data: {
      businessName,
      businessType,
      phone,
      status:
        merchant.status === "ACTIVE"
          ? "ACTIVE"
          : "PENDING",
    },
  });

  return updatedMerchant;
}

/**
 * Get merchant profile with KYC information
 */
export async function getMerchantProfile(
  userId: string
) {
  const normalizedUserId = userId?.trim();

  if (!normalizedUserId) {
    throw new Error("User ID is required");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      userId: normalizedUserId,
    },
    include: {
      kyc: true,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  return merchant;
}

/**
 * Activate merchant after successful KYC verification
 */
export async function activateMerchant(
  merchantId: string
) {
  const normalizedMerchantId = merchantId?.trim();

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: normalizedMerchantId,
    },
    include: {
      kyc: true,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status === "SUSPENDED") {
    throw new Error("Merchant account is suspended");
  }

  if (!merchant.kyc) {
    throw new Error("KYC verification is required");
  }

  if (merchant.kyc.status !== "VERIFIED") {
    throw new Error("Merchant KYC is not verified");
  }

  return prisma.merchant.update({
    where: {
      id: normalizedMerchantId,
    },
    data: {
      status: "ACTIVE",
    },
  });
}