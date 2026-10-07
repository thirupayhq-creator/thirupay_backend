import dotenv from "dotenv";
dotenv.config();

import { cashfreePartnerService } from "../src/modules/merchant/cashfree-partner.service";
import prisma from "../src/core/config/database";

async function main() {
  const m = await prisma.merchant.findFirst({
    where: { user: { email: "shoppingmart@gmail.com" } },
    include: { kyc: true },
  });

  if (!m) {
    console.error("Merchant not found in DB");
    return;
  }

  console.log(`Creating sub-merchant on Cashfree Partner platform for ${m.businessName} (${m.id})...`);

  try {
    const cf = await cashfreePartnerService.createMerchant({
      merchantId: m.id,
      merchantName: m.businessName,
      merchantEmail: "shoppingmart@gmail.com",
      pocPhone: m.phone || "9876543211",
      merchantSiteUrl: "https://tirupay.com",
      businessDetails: {
        businessLegalName: m.businessName,
        businessType: "PRIVATE_LIMITED",
        businessPan: m.kyc[0]?.pan || "ABCDE1234F",
        businessGstin: m.gst || undefined,
      },
    });

    console.log("✅ Successfully created on Cashfree Partner platform:", cf);

    await prisma.merchant.update({
      where: { id: m.id },
      data: {
        cashfreeMerchantId: cf.merchant_id || m.id,
        cashfreeStatus: (cf.onboarding_status as string) || "CREATED",
      },
    });
    console.log("Updated PostgreSQL merchant record with Cashfree ID!");
  } catch (err: any) {
    console.error("Cashfree creation error:", err.message);
  }
}

main().finally(() => prisma.$disconnect());
