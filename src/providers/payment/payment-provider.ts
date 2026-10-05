import { CashfreePaymentProvider } from "./cashfree.provider";

/**
 * ==========================================
 * PAYMENT PROVIDER INTERFACE
 * ==========================================
 */

export interface PaymentProvider {
  readonly name: string;

  /**
   * Create a payment/order with the provider.
   */
  createPayment(input: {
    amount: number;
    currency: string;
    orderId: string;
  }): Promise<{
    providerRef: string;
    paymentSessionId?: string;
  }>;

  /**
   * Verify payment status with the provider.
   */
  verifyPayment(
    providerRef: string
  ): Promise<{
    success: boolean;
  }>;

  /**
   * Refund a payment.
   */
  refundPayment(
    providerRef: string,
    amount: number
  ): Promise<{
    providerRef: string;
  }>;

  /**
   * Create a payout.
   *
   * Cashfree PG and Cashfree Payouts are
   * separate products.
   */
  createPayout(input: {
    amount: number;
    currency: string;
    beneficiary: string;
  }): Promise<{
    providerRef: string;
  }>;
}

/**
 * ==========================================
 * GET PAYMENT PROVIDER
 * ==========================================
 *
 * Supported:
 *
 * PAYMENT_PROVIDER=CASHFREE
 * PAYMENT_PROVIDER=MOCK
 *
 * For real Cashfree payments, use:
 *
 * PAYMENT_PROVIDER=CASHFREE
 */

export function getPaymentProvider(): PaymentProvider {
  const provider = (
    process.env.PAYMENT_PROVIDER || "MOCK"
  )
    .trim()
    .toUpperCase();

  switch (provider) {
    /**
     * ========================================
     * CASHFREE
     * ========================================
     */

    case "CASHFREE":
      return new CashfreePaymentProvider();

    /**
     * ========================================
     * MOCK
     * ========================================
     *
     * Useful for local testing without
     * calling Cashfree.
     */

    case "MOCK":
      return new MockPaymentProvider();

    /**
     * ========================================
     * RAZORPAY
     * ========================================
     *
     * Razorpay has been removed from the
     * current TIRU PAY configuration.
     */

    case "RAZORPAY":
      throw new Error(
        "Razorpay provider is no longer configured. Use CASHFREE or MOCK."
      );

    /**
     * ========================================
     * INVALID PROVIDER
     * ========================================
     */

    default:
      throw new Error(
        `Unsupported payment provider: ${provider}. Use CASHFREE or MOCK.`
      );
  }
}

/**
 * ==========================================
 * MOCK PAYMENT PROVIDER
 * ==========================================
 *
 * Used when:
 *
 * PAYMENT_PROVIDER=MOCK
 *
 * This provider DOES NOT create a real
 * payment.
 */

class MockPaymentProvider
  implements PaymentProvider
{
  readonly name = "MOCK";

  /**
   * ========================================
   * CREATE MOCK PAYMENT
   * ========================================
   */

  async createPayment(input: {
    amount: number;
    currency: string;
    orderId: string;
  }): Promise<{
    providerRef: string;
    paymentSessionId?: string;
  }> {
    const amount = Number(input.amount);

    const currency =
      input.currency
        ?.trim()
        .toUpperCase();

    const orderId =
      input.orderId?.trim();

    /**
     * Validate amount
     */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Amount must be greater than zero"
      );
    }

    /**
     * Validate currency
     */

    if (!currency) {
      throw new Error(
        "Currency is required"
      );
    }

    /**
     * Validate order ID
     */

    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    return {
      providerRef:
        `mock_pay_${Date.now()}_${orderId}`,
    };
  }

  /**
   * ========================================
   * VERIFY MOCK PAYMENT
   * ========================================
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
      success:
        reference.startsWith(
          "mock_pay_"
        ),
    };
  }

  /**
   * ========================================
   * REFUND MOCK PAYMENT
   * ========================================
   */

  async refundPayment(
    providerRef: string,
    amount: number
  ): Promise<{
    providerRef: string;
  }> {
    const reference =
      providerRef?.trim();

    const refundAmount =
      Number(amount);

    if (!reference) {
      throw new Error(
        "Provider payment reference is required"
      );
    }

    if (
      !Number.isFinite(
        refundAmount
      ) ||
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
   * ========================================
   * CREATE MOCK PAYOUT
   * ========================================
   */

  async createPayout(input: {
    amount: number;
    currency: string;
    beneficiary: string;
  }): Promise<{
    providerRef: string;
  }> {
    const amount =
      Number(input.amount);

    const currency =
      input.currency
        ?.trim()
        .toUpperCase();

    const beneficiary =
      input.beneficiary?.trim();

    /**
     * Validate amount
     */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Payout amount must be greater than zero"
      );
    }

    /**
     * Validate currency
     */

    if (!currency) {
      throw new Error(
        "Currency is required"
      );
    }

    /**
     * Validate beneficiary
     */

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