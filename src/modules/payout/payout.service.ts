import prisma from "../../core/config/database";
import { CreatePayoutInput } from "./payout.schema";

interface CreatePayoutOptions extends CreatePayoutInput {
  merchantId: string;
}

export async function createPayout(options: CreatePayoutOptions) {
  const { merchantId, amount, currency = "INR", beneficiaryId, metadata } = options;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status !== "ACTIVE") {
    throw new Error(
      `Cannot initiate payouts for inactive merchant (current status: ${merchant.status})`
    );
  }

  // Create Payout record
  const payout = await prisma.payout.create({
    data: {
      merchantId,
      amount,
      currency,
      beneficiaryId,
      status: "CREATED",
      provider: "MANUAL",
      providerPayoutId: `payout_${Date.now()}`,
      metadata,
    },
  });

  return payout;
}

export async function getPayoutById(payoutId: string, merchantId?: string) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) {
    throw new Error("Payout record not found");
  }

  if (merchantId && payout.merchantId !== merchantId) {
    throw new Error("Payout record not found");
  }

  return payout;
}

export async function listPayouts(merchantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where: { merchantId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payout.count({ where: { merchantId } }),
  ]);

  return { items, total, page, limit };
}
