import {
  PaymentProvider,
  CreatePaymentInput,
  ProviderPaymentResponse,
  ProviderVerifyResponse,
  ProviderRefundResponse,
} from "./payment-provider.interface";

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "MOCK";

  async createPayment(input: CreatePaymentInput): Promise<ProviderPaymentResponse> {
    const amount = Number(input.amount);
    const orderId = input.orderId?.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    return {
      providerRef: `mock_order_${orderId}`,
      paymentSessionId: `mock_session_${Date.now()}_${orderId}`,
      cfOrderId: `mock_cf_${Date.now()}`,
      orderStatus: "ACTIVE",
    };
  }

  async verifyPayment(providerRef: string): Promise<ProviderVerifyResponse> {
    const reference = providerRef?.trim();
    if (!reference) {
      throw new Error("Provider payment reference is required");
    }

    return {
      success: true,
      status: "SUCCESS",
      providerPaymentId: `mock_pay_${Date.now()}`,
      paymentMethod: "UPI",
      paidAt: new Date(),
    };
  }

  async refundPayment(
    providerRef: string,
    amount: number,
    _refundNote?: string
  ): Promise<ProviderRefundResponse> {
    const reference = providerRef?.trim();
    const refundAmount = Number(amount);

    if (!reference) {
      throw new Error("Provider payment reference is required");
    }

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw new Error("Refund amount must be greater than zero");
    }

    return {
      providerRef: `mock_ref_${Date.now()}`,
      refundStatus: "SUCCESS",
    };
  }
}
