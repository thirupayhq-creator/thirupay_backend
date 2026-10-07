import { env } from "../../../core/config/env";
import { PaymentProvider } from "./payment-provider.interface";
import { CashfreePaymentProvider } from "./cashfree.provider";
import { MockPaymentProvider } from "./mock-payment.provider";

export * from "./payment-provider.interface";
export * from "./cashfree.provider";
export * from "./mock-payment.provider";

export function getPaymentProvider(): PaymentProvider {
  if (process.env.NODE_ENV === "test") {
    return new MockPaymentProvider();
  }

  const providerName = env.PAYMENT_PROVIDER.toUpperCase();

  if (providerName === "CASHFREE") {
    const hasMerchantCredentials = Boolean(env.CASHFREE_CLIENT_ID && env.CASHFREE_CLIENT_SECRET);
    const hasPartnerCredentials = Boolean(env.CASHFREE_PARTNER_API_KEY);

    if (!hasMerchantCredentials && !hasPartnerCredentials) {
      return new MockPaymentProvider();
    }
    return new CashfreePaymentProvider();
  }

  switch (providerName) {
    case "MOCK":
      return new MockPaymentProvider();
    default:
      console.warn(
        `[PaymentProvider] Unknown provider: ${providerName}. Falling back to MOCK.`
      );
      return new MockPaymentProvider();
  }
}
