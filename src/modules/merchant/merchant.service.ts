import prisma from "../../core/config/database";
import { OnboardMerchantInput, UpdateMerchantStatusInput } from "./merchant.schema";
import { MerchantStatus } from "@prisma/client";

export async function onboardMerchant(userId: string, input: OnboardMerchantInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchant: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.merchant) {
    const updated = await prisma.merchant.update({
      where: { id: user.merchant.id },
      data: {
        businessName: input.businessName,
        businessType: input.businessType ?? user.merchant.businessType,
        phone: input.phone ?? user.merchant.phone,
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

  return merchant;
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
