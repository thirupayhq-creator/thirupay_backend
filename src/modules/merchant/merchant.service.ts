import prisma from "../../core/config/database";
import { OnboardMerchantInput, UpdateMerchantStatusInput } from "./merchant.schema";
import { MerchantStatus } from "@prisma/client";
import { cashfreePartnerService } from "./cashfree-partner.service";

export async function onboardMerchant(userId: string, input: OnboardMerchantInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchant: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const ownerName = input.ownerName || input.owner_name || user.name;
  const businessCategory = input.businessCategory || input.business_category || undefined;
  const entityType = input.entityType || input.entity_type || undefined;
  const addressLine1 = input.addressLine1 || input.address_line1 || undefined;
  const addressLine2 = input.addressLine2 || input.address_line2 || undefined;
  const businessPhoto = input.businessPhoto || input.business_photo || undefined;
  const accountHolder = input.accountHolder || input.account_holder || undefined;
  const accountNumber = input.accountNumber || input.account_number || undefined;
  const bankName = input.bankName || input.bank_name || undefined;

  if (user.merchant) {
    const updated = await prisma.merchant.update({
      where: { id: user.merchant.id },
      data: {
        businessName: input.businessName,
        businessType: input.businessType ?? user.merchant.businessType,
        phone: input.phone ?? user.merchant.phone,
        ownerName: ownerName ?? user.merchant.ownerName,
        businessCategory: businessCategory ?? user.merchant.businessCategory,
        entityType: entityType ?? user.merchant.entityType,
        gst: input.gst ?? user.merchant.gst,
        addressLine1: addressLine1 ?? user.merchant.addressLine1,
        addressLine2: addressLine2 ?? user.merchant.addressLine2,
        pincode: input.pincode ?? user.merchant.pincode,
        city: input.city ?? user.merchant.city,
        state: input.state ?? user.merchant.state,
        businessPhoto: businessPhoto ?? user.merchant.businessPhoto,
        accountHolder: accountHolder ?? user.merchant.accountHolder,
        accountNumber: accountNumber ?? user.merchant.accountNumber,
        ifsc: input.ifsc ?? user.merchant.ifsc,
        bankName: bankName ?? user.merchant.bankName,
        branch: input.branch ?? user.merchant.branch,
      },
      include: {
        kyc: true,
      },
    });
    return updated;
  }

  const created = await prisma.merchant.create({
    data: {
      userId,
      businessName: input.businessName,
      businessType: input.businessType ?? "OTHER",
      phone: input.phone ?? "",
      status: "PENDING",
      ownerName: ownerName || user.name,
      businessCategory: businessCategory || null,
      entityType: entityType || null,
      gst: input.gst || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      pincode: input.pincode || null,
      city: input.city || null,
      state: input.state || null,
      businessPhoto: businessPhoto || null,
      accountHolder: accountHolder || null,
      accountNumber: accountNumber || null,
      ifsc: input.ifsc || null,
      bankName: bankName || null,
      branch: input.branch || null,
    },
    include: {
      kyc: true,
    },
  });

  return created;
}

export async function getMerchantProfile(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: {
      kyc: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  let onboardingLink = null;
  if (merchant.cashfreeMerchantId || merchant.status === "ACTIVE") {
    try {
      const lookupId = merchant.cashfreeMerchantId || merchant.id;
      onboardingLink = await cashfreePartnerService.getOnboardingLink(lookupId);
    } catch {
      // Non-blocking fallback
    }
  }

  return {
    ...merchant,
    cashfreeOnboardingLink: onboardingLink,
  };
}

export async function getPublicMerchant(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      businessName: true,
      businessType: true,
      status: true,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status === "SUSPENDED") {
    throw new Error("Merchant account is unavailable");
  }

  return merchant;
}

export async function listMerchants(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        kyc: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.merchant.count(),
  ]);

  return { items: merchants, total, page, limit };
}

export async function updateMerchantStatus(merchantId: string, status: MerchantStatus) {
  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: { status },
  });

  return merchant;
}

export async function getCashfreeOnboardingLink(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const lookupId = merchant.cashfreeMerchantId || merchant.id;
  const onboardingLink = await cashfreePartnerService.getOnboardingLink(lookupId);

  return {
    merchantId: merchant.id,
    cashfreeMerchantId: lookupId,
    cashfreeStatus: merchant.cashfreeStatus || "PENDING",
    onboardingLink,
  };
}

export async function syncCashfreeStatus(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const lookupId = merchant.cashfreeMerchantId || merchant.id;
  const syncResult = await cashfreePartnerService.syncMerchantStatus(lookupId);

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      cashfreeStatus: syncResult.activationStatus,
    },
  });

  return {
    merchantId: merchant.id,
    cashfreeMerchantId: lookupId,
    cashfreeStatus: updated.cashfreeStatus,
    productStatus: syncResult.productStatus,
    onboardingStatus: syncResult.onboardingStatus,
  };
}
