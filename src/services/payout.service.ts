import prisma from "../config/database";
import { getPaymentProvider } from "../providers/payment/payment-provider";
import type { InputJsonValue } from "@prisma/client/runtime/library";

interface CreatePayoutInput {
  merchantId: string;
  amount: number;
  currency: string;
  beneficiaryId: string;
  metadata?: InputJsonValue;
}

/**
 * Create Payout
 *
 * Note:
 * Cashfree Payouts is a separate integration from Cashfree Payments.
 * The payment provider must have a configured Payouts implementation
 * before this endpoint can create real payouts.
 */
export async function createPayout(
  input: CreatePayoutInput
) {
  const merchantId = input.merchantId?.trim();
  const beneficiaryId = input.beneficiaryId?.trim();
  const currency = input.currency?.trim().toUpperCase();
  const amount = Number(input.amount);
  const metadata = input.metadata;

  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Payout amount must be greater than zero"
    );
  }

  // Allow normal floating-point representation errors, but still reject
  // values that genuinely contain more than two decimal places.
  const amountInCents = amount * 100;
  if (
    Math.abs(amountInCents - Math.round(amountInCents)) >
    1e-9
  ) {
    throw new Error(
      "Payout amount can have a maximum of 2 decimal places"
    );
  }

  if (!currency) {
    throw new Error("Currency is required");
  }

  if (currency !== "INR") {
    throw new Error(
      "Only INR currency is supported"
    );
  }

  if (!beneficiaryId) {
    throw new Error(
      "Beneficiary ID is required"
    );
  }

  /**
   * ----------------------------------------------------------
   * 1. CHECK MERCHANT
   * ----------------------------------------------------------
   */
  const merchant =
    await prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
    });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (merchant.status !== "ACTIVE") {
    throw new Error(
      "Merchant must be ACTIVE to create a payout"
    );
  }

  /**
   * ----------------------------------------------------------
   * 2. GET PAYMENT/PAYOUT PROVIDER
   * ----------------------------------------------------------
   */
  const provider = getPaymentProvider();

  /**
   * ----------------------------------------------------------
   * 3. CREATE PROVIDER PAYOUT
   * ----------------------------------------------------------
   *
   * Cashfree Payouts requires a separate Payouts API
   * integration.
   */
  const providerPayout =
    await provider.createPayout({
      amount,
      currency,
      beneficiary: beneficiaryId,
    });

  if (!providerPayout?.providerRef) {
    throw new Error(
      "Payout provider reference was not returned"
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. SAVE PAYOUT IN POSTGRESQL
   * ----------------------------------------------------------
   */
  const payout =
    await prisma.payout.create({
      data: {
        merchantId,
        amount,
        currency,
        beneficiaryId,
        provider: provider.name,
        providerPayoutId:
          providerPayout.providerRef,

        // Prisma schema does not have PENDING.
        // Provider payout starts in PROCESSING.
        status: "PROCESSING",

        metadata,
      },
    });

  return payout;
}

/**
 * Get Payout By ID
 */
export async function getPayoutById(
  payoutId: string,
  merchantId: string
) {
  const normalizedPayoutId =
    payoutId?.trim();

  const normalizedMerchantId =
    merchantId?.trim();

  if (!normalizedPayoutId) {
    throw new Error("Payout ID is required");
  }

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  const payout =
    await prisma.payout.findFirst({
      where: {
        id: normalizedPayoutId,
        merchantId: normalizedMerchantId,
      },
    });

  if (!payout) {
    throw new Error("Payout not found");
  }

  return payout;
}

/**
 * Get All Merchant Payouts
 */
export async function getMerchantPayouts(
  merchantId: string
) {
  const normalizedMerchantId =
    merchantId?.trim();

  if (!normalizedMerchantId) {
    throw new Error("Merchant ID is required");
  }

  return prisma.payout.findMany({
    where: {
      merchantId: normalizedMerchantId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Update Payout Status
 *
 * Used by provider/webhook processing.
 */
export async function updatePayoutStatus(
  providerPayoutId: string,
  status:
    | "PROCESSING"
    | "SUCCESS"
    | "FAILED"
) {
  const normalizedProviderPayoutId =
    providerPayoutId?.trim();

  if (!normalizedProviderPayoutId) {
    throw new Error(
      "Provider payout ID is required"
    );
  }

  const payout =
    await prisma.payout.findFirst({
      where: {
        providerPayoutId:
          normalizedProviderPayoutId,
      },
    });

  if (!payout) {
    throw new Error("Payout not found");
  }

  /**
   * Don't move a completed payout backwards
   * to PROCESSING.
   */
  if (
    (payout.status === "SUCCESS" ||
      payout.status === "FAILED") &&
    status === "PROCESSING"
  ) {
    return payout;
  }

  return prisma.payout.update({
    where: {
      id: payout.id,
    },
    data: {
      status,
      processedAt:
        status === "SUCCESS" ||
        status === "FAILED"
          ? payout.processedAt ?? new Date()
          : null,
    },
  });
}