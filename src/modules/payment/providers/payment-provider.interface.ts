export interface CreatePaymentInput {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  returnUrl?: string;
  notifyUrl?: string;
  note?: string;
}

export interface ProviderPaymentResponse {
  providerRef: string;
  paymentSessionId?: string;
  cfOrderId?: string;
  orderStatus?: string;
}

export interface ProviderVerifyResponse {
  success: boolean;
  status: string;
  providerPaymentId?: string;
  paymentMethod?: string;
  paidAt?: Date;
  rawDetails?: unknown;
}

export interface ProviderRefundResponse {
  providerRef: string;
  refundStatus: string;
}

export interface PaymentProvider {
  readonly name: string;

  /**
   * Create an order/payment session with the provider.
   */
  createPayment(input: CreatePaymentInput): Promise<ProviderPaymentResponse>;

  /**
   * Query provider for payment status.
   */
  verifyPayment(providerRef: string): Promise<ProviderVerifyResponse>;

  /**
   * Create a refund with the provider.
   */
  refundPayment(
    providerRef: string,
    amount: number,
    refundNote?: string
  ): Promise<ProviderRefundResponse>;
}
