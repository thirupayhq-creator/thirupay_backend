import crypto from "crypto";
import { PaymentProvider } from "./payment-provider";

type HeadersInit = Record<string, string>;

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
}

interface CashfreePaymentResponse {
  cf_payment_id: string;
  order_id: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
}

interface CashfreeRefundResponse {
  cf_payment_id?: string;
  cf_refund_id: string;
  refund_id?: string;
  refund_status: string;
  refund_amount: number;
}

interface CashfreeErrorResponse {
  message?: string;
  code?: string;
  type?: string;
}

export class CashfreePaymentProvider
  implements PaymentProvider
{
  readonly name = "CASHFREE";

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor() {
    this.clientId =
      process.env.CASHFREE_CLIENT_ID ||
      process.env.CASHFREE_APP_ID ||
      "";

    this.clientSecret =
      process.env.CASHFREE_CLIENT_SECRET ||
      process.env.CASHFREE_SECRET_KEY ||
      "";

    const environment = (
      process.env.CASHFREE_ENVIRONMENT || "sandbox"
    )
      .trim()
      .toLowerCase();

    this.baseUrl =
      environment === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    this.apiVersion =
      process.env.CASHFREE_API_VERSION ||
      "2025-01-01";

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Cashfree API credentials are not configured"
      );
    }
  }

  /**
   * Cashfree authentication headers
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-client-id": this.clientId,
      "x-client-secret": this.clientSecret,
      "x-api-version": this.apiVersion,
    };
  }

  /**
   * Generic Cashfree API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      }
    );

    const responseText =
      await response.text();

    let data: unknown = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    if (!response.ok) {
      const errorData =
        data as CashfreeErrorResponse;

      throw new Error(
        errorData?.message ||
          `Cashfree API request failed with status ${response.status}`
      );
    }

    return data as T;
  }

  /**
   * Create Cashfree payment order
   *
   * Cashfree returns a payment_session_id.
   *
   * The payment_session_id is required by the
   * Cashfree frontend SDK to open Checkout.
   */
  async createPayment(input: {
    amount: number;
    currency: string;
    orderId: string;
  }): Promise<{
    providerRef: string;
    paymentSessionId: string;
  }> {
    const amount = Number(input.amount);
    const currency =
      input.currency?.trim().toUpperCase();
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

    if (currency !== "INR") {
      throw new Error(
        "Only INR currency is supported"
      );
    }

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const order =
      await this.request<CashfreeOrderResponse>(
        "/orders",
        {
          method: "POST",
          headers: {
            "x-idempotency-key": crypto
              .randomUUID(),
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: amount,
            order_currency: currency,
            customer_details: {
              customer_id: orderId,
              customer_phone:
                process.env.DEFAULT_CUSTOMER_PHONE ||
                "9999999999",
            },
            order_meta: {
              return_url:
                process.env.CASHFREE_RETURN_URL ||
                "http://localhost:3000/payment/success?order_id={order_id}",
              notify_url:
                process.env.CASHFREE_WEBHOOK_URL ||
                "http://localhost:5000/api/v1/webhooks/payment",
            },
          }),
        }
      );

    /*
     * PaymentProvider interface has only providerRef.
     *
     * Store both values in your payment service:
     * - order.order_id
     * - order.payment_session_id
     *
     * The providerRef is the Cashfree order ID.
     */
    return {
      providerRef: order.order_id,
      paymentSessionId: order.payment_session_id,
    };
  }

  /**
   * Verify Cashfree payment
   *
   * Cashfree provides the payment status through:
   * GET /orders/{order_id}/payments
   */
  async verifyPayment(
    providerRef: string
  ): Promise<{
    success: boolean;
  }> {
    const orderId = providerRef?.trim();

    if (!orderId) {
      throw new Error(
        "Cashfree order ID is required"
      );
    }

    const payments =
      await this.request<
        CashfreePaymentResponse[]
      >(`/orders/${encodeURIComponent(orderId)}/payments`, {
        method: "GET",
      });

    if (!Array.isArray(payments)) {
      return {
        success: false,
      };
    }

    const successfulPayment =
      payments.find(
        (payment) =>
          payment.payment_status === "SUCCESS"
      );

    return {
      success: Boolean(successfulPayment),
    };
  }

  /**
   * Refund Cashfree payment
   *
   * Cashfree refund API requires:
   * - order_id
   * - refund_id
   * - refund_amount
   */
  async refundPayment(
    providerRef: string,
    amount: number
  ): Promise<{
    providerRef: string;
  }> {
    const orderId = providerRef?.trim();
    const refundAmount = Number(amount);

    if (!orderId) {
      throw new Error(
        "Cashfree order ID is required"
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

    const refundId =
      `refund_${Date.now()}_${crypto
        .randomBytes(4)
        .toString("hex")}`;

    const refund =
      await this.request<CashfreeRefundResponse>(
        `/orders/${encodeURIComponent(
          orderId
        )}/refunds`,
        {
          method: "POST",
          headers: {
            "x-idempotency-key":
              crypto.randomUUID(),
          },
          body: JSON.stringify({
            refund_amount: refundAmount,
            refund_id: refundId,
          }),
        }
      );

    return {
      providerRef:
        refund.cf_refund_id ||
        refund.refund_id ||
        refundId,
    };
  }

  /**
   * Cashfree Payouts are a separate product/API
   * from Payment Gateway.
   *
   * Do not use the Payment Gateway credentials
   * as a Payouts integration.
   */
  async createPayout(input: {
    amount: number;
    currency: string;
    beneficiary: string;
  }): Promise<{
    providerRef: string;
  }> {
    const amount = Number(input.amount);
    const currency =
      input.currency?.trim().toUpperCase();
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

    throw new Error(
      "Cashfree Payouts requires a separate Cashfree Payouts integration. Configure the Payouts API before enabling this method."
    );
  }
}

/**
 * Verify Cashfree webhook signature.
 *
 * Cashfree signs:
 *
 * timestamp + raw request body
 *
 * using HMAC-SHA256 and returns the result
 * as Base64.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  timestamp: string,
  clientSecret: string
): boolean {
  if (
    !signature ||
    !timestamp ||
    !clientSecret
  ) {
    return false;
  }

  const bodyBuffer =
    Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(rawBody, "utf8");

  const signaturePayload =
    Buffer.concat([
      Buffer.from(timestamp, "utf8"),
      bodyBuffer,
    ]);

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        clientSecret
      )
      .update(signaturePayload)
      .digest("base64");

  const expected =
    Buffer.from(
      expectedSignature,
      "utf8"
    );

  const received =
    Buffer.from(
      signature,
      "utf8"
    );

  if (
    expected.length !==
    received.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expected,
    received
  );
}