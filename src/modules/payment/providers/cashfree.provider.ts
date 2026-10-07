import crypto from "crypto";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/config/logger";
import {
  PaymentProvider,
  CreatePaymentInput,
  ProviderPaymentResponse,
  ProviderVerifyResponse,
  ProviderRefundResponse,
} from "./payment-provider.interface";

interface CashfreeOrderApiResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
}

interface CashfreePaymentItem {
  cf_payment_id: string;
  order_id: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | string;
  payment_amount: number;
  payment_currency: string;
  payment_time?: string;
  payment_group?: string;
  payment_method?: Record<string, unknown>;
}

interface CashfreeRefundApiResponse {
  cf_payment_id?: string;
  cf_refund_id: string;
  refund_id?: string;
  refund_status: "SUCCESS" | "PENDING" | "ONHOLD" | "FAILED" | string;
  refund_amount: number;
}

interface CashfreeErrorResponse {
  message?: string;
  code?: string;
  type?: string;
}

export class CashfreePaymentProvider implements PaymentProvider {
  readonly name = "CASHFREE";

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly partnerApiKey: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly isProduction: boolean;

  constructor() {
    this.clientId = env.CASHFREE_CLIENT_ID;
    this.clientSecret = env.CASHFREE_CLIENT_SECRET;
    this.partnerApiKey = env.CASHFREE_PARTNER_API_KEY;
    this.apiVersion = env.CASHFREE_API_VERSION;

    this.isProduction = env.CASHFREE_ENV === "production";
    this.baseUrl = this.isProduction
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    logger.info(`Cashfree Payment Provider initialized in [${this.isProduction ? "PRODUCTION" : "SANDBOX"}] mode`);
  }

  private getHeaders(merchantId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-version": this.apiVersion,
    };

    if (this.clientId && this.clientSecret) {
      headers["x-client-id"] = this.clientId;
      headers["x-client-secret"] = this.clientSecret;
      return headers;
    }

    if (this.partnerApiKey) {
      headers["x-partner-apikey"] = this.partnerApiKey;
      if (merchantId) {
        headers["x-partner-merchantid"] = merchantId;
      }
      return headers;
    }

    throw new Error(
      "Cashfree credentials missing. Please set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET (or CASHFREE_PARTNER_API_KEY) in your .env file."
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    merchantId?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getHeaders(merchantId),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let data: unknown = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      const errorData = data as CashfreeErrorResponse;
      const errorMsg =
        errorData?.message ||
        `Cashfree API request to ${endpoint} failed with HTTP ${response.status}`;
      logger.error("Cashfree API Error", { endpoint, status: response.status, data });
      throw new Error(errorMsg);
    }

    return data as T;
  }

  /**
   * Create an order in Cashfree PG
   * Returns orderId and payment_session_id required by Cashfree JS Checkout
   */
  async createPayment(input: CreatePaymentInput): Promise<ProviderPaymentResponse> {
    const amount = Number(input.amount);
    const currency = (input.currency || "INR").trim().toUpperCase();
    const orderId = input.orderId.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    if (currency !== "INR") {
      throw new Error("Cashfree only supports INR currency currently");
    }

    const customerPhone = input.customerPhone || env.DEFAULT_CUSTOMER_PHONE || "9999999999";
    const customerId = input.customerId || `cust_${orderId}`;
    const returnUrl = input.returnUrl || env.CASHFREE_RETURN_URL;
    const notifyUrl = input.notifyUrl || env.CASHFREE_WEBHOOK_URL;

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
        customer_email: input.customerEmail || undefined,
        customer_name: input.customerName || undefined,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_note: input.note || `Order ${orderId}`,
    };

    const subMerchantId = (input.metadata?.subMerchantId || input.metadata?.merchantId) as string | undefined;

    const order = await this.request<CashfreeOrderApiResponse>(
      "/orders",
      {
        method: "POST",
        headers: {
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      },
      subMerchantId
    );

    return {
      providerRef: order.order_id,
      paymentSessionId: order.payment_session_id,
      cfOrderId: order.cf_order_id,
      orderStatus: order.order_status,
    };
  }

  /**
   * Verify payment status for an order
   * Calls Cashfree GET /orders/{order_id}/payments
   */
  async verifyPayment(providerRef: string): Promise<ProviderVerifyResponse> {
    const orderId = providerRef.trim();
    if (!orderId) {
      throw new Error("Order ID is required for verification");
    }

    const payments = await this.request<CashfreePaymentItem[]>(
      `/orders/${encodeURIComponent(orderId)}/payments`,
      { method: "GET" }
    );

    if (!Array.isArray(payments) || payments.length === 0) {
      return {
        success: false,
        status: "PENDING",
        rawDetails: payments,
      };
    }

    const successfulPayment = payments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    if (successfulPayment) {
      return {
        success: true,
        status: "SUCCESS",
        providerPaymentId: successfulPayment.cf_payment_id,
        paymentMethod: successfulPayment.payment_group || "OTHER",
        paidAt: successfulPayment.payment_time
          ? new Date(successfulPayment.payment_time)
          : new Date(),
        rawDetails: successfulPayment,
      };
    }

    const latest = payments[payments.length - 1];
    return {
      success: false,
      status: latest.payment_status,
      providerPaymentId: latest.cf_payment_id,
      paymentMethod: latest.payment_group,
      rawDetails: latest,
    };
  }

  /**
   * Refund an order through Cashfree PG
   * Calls Cashfree POST /orders/{order_id}/refunds
   */
  async refundPayment(
    providerRef: string,
    amount: number,
    refundNote?: string
  ): Promise<ProviderRefundResponse> {
    const orderId = providerRef.trim();
    const refundAmount = Number(amount);

    if (!orderId) {
      throw new Error("Order ID is required for refund");
    }

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw new Error("Refund amount must be greater than zero");
    }

    const refundId = `ref_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const refund = await this.request<CashfreeRefundApiResponse>(
      `/orders/${encodeURIComponent(orderId)}/refunds`,
      {
        method: "POST",
        headers: {
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          refund_amount: refundAmount,
          refund_id: refundId,
          refund_note: refundNote || "Merchant initiated refund",
        }),
      }
    );

    return {
      providerRef: refund.cf_refund_id || refund.refund_id || refundId,
      refundStatus: refund.refund_status,
    };
  }
}
