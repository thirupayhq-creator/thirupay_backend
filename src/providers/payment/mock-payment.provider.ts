import { PaymentProvider } from "./payment-provider";

export class MockPaymentProvider
  implements PaymentProvider
{
  readonly name = "MOCK";

  /**
   * Create mock payment
   */
  async createPayment(input: {
    amount: number;
    currency: string;
    orderId: string;
  }): Promise<{
    providerRef: string;
  }> {
    const amount = Number(input.amount);
    const currency = input.currency
      ?.trim()
      .toUpperCase();
    const orderId = input.orderId?.trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Amount must be greater than zero"
      );
    }

    if (!currency) {
      throw new Error("Currency is required");
    }

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    return {
      providerRef:
        `mock_pay_${Date.now()}_${orderId}`,
    };
  }

  /**
   * Verify mock payment
   */
  async verifyPayment(
    providerRef: string
  ): Promise<{
    success: boolean;
  }> {
    const reference =
      providerRef?.trim();

    if (!reference) {
      throw new Error(
        "Provider payment reference is required"
      );
    }

    return {
      success: reference.startsWith(
        "mock_pay_"
      ),
    };
  }

  /**
   * Refund mock payment
   */
  async refundPayment(
    providerRef: string,
    amount: number
  ): Promise<{
    providerRef: string;
  }> {
    const reference =
      providerRef?.trim();
    const refundAmount = Number(amount);

    if (!reference) {
      throw new Error(
        "Provider payment reference is required"
      );
    }

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0
    ) {
      throw new Error(
        "Refund amount must be greater than zero"
      );
    }

    return {
      providerRef:
        `mock_ref_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,
    };
  }

  /**
   * Create mock payout
   */
  async createPayout(input: {
    amount: number;
    currency: string;
    beneficiary: string;
  }): Promise<{
    providerRef: string;
  }> {
    const amount = Number(input.amount);
    const currency = input.currency
      ?.trim()
      .toUpperCase();
    const beneficiary =
      input.beneficiary?.trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Payout amount must be greater than zero"
      );
    }

    if (!currency) {
      throw new Error("Currency is required");
    }

    if (!beneficiary) {
      throw new Error(
        "Beneficiary is required"
      );
    }

    return {
      providerRef:
        `mock_payout_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,
    };
  }
}