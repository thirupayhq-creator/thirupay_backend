import { env } from "../../../core/config/env";
import { PaymentProvider } from "./payment-provider.interface";
import { CashfreePaymentProvider } from "./cashfree.provider";
import { MockPaymentProvider } from "./mock-payment.provider";

export * from "./payment-provider.interface";
export * from "./cashfree.provider";
export * from "./mock-payment.provider";

export function getPaymentProvider(): PaymentProvider {
  const providerName = env.PAYMENT_PROVIDER.toUpperCase();

  if (providerName === "CASHFREE") {
    if (!env.CASHFREE_CLIENT_ID || !env.CASHFREE_CLIENT_SECRET) {
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
