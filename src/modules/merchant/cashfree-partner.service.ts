import { env } from "../../core/config/env";
import { logger } from "../../core/config/logger";

export interface CreatePartnerMerchantInput {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  pocPhone: string;
  merchantSiteUrl?: string;
  businessDetails?: {
    businessLegalName?: string;
    businessType?: string;
    businessModel?: string;
    businessPan?: string;
    businessGstin?: string;
  };
}

export interface CashfreePartnerMerchantResponse {
  merchant_id: string;
  merchant_name?: string;
  merchant_status?: string;
  account_status?: string;
  onboarding_link?: string;
  [key: string]: unknown;
}

export class CashfreePartnerService {
  private readonly partnerApiKey: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor() {
    this.partnerApiKey = env.CASHFREE_PARTNER_API_KEY;
    this.apiVersion = "2023-01-01";
    this.baseUrl = env.CASHFREE_PARTNER_API_URL;
  }

  private getHeaders(): Record<string, string> {
    if (!this.partnerApiKey) {
      throw new Error(
        "Cashfree Partner API Key is not configured. Please set CASHFREE_PARTNER_API_KEY in your .env file."
      );
    }

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-partner-apikey": this.partnerApiKey,
      "x-api-version": this.apiVersion,
    };
  }

  /**
   * Ping / verify Cashfree Partner API connectivity
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({}),
      });

      // 400 Bad Request indicates successful authentication (validation error for empty body)
      // 401 Unauthorized indicates invalid API key
      return response.status !== 401;
    } catch (error) {
      logger.error("Failed to connect to Cashfree Partner API", { error });
      return false;
    }
  }

  /**
   * Create a sub-merchant under the partner account in Cashfree
   */
  async createMerchant(input: CreatePartnerMerchantInput): Promise<CashfreePartnerMerchantResponse> {
    const payload = {
      merchant_id: input.merchantId,
      merchant_name: input.merchantName,
      merchant_email: input.merchantEmail,
      poc_phone: input.pocPhone,
      merchant_site_url: input.merchantSiteUrl || "https://tirupay.com",
      business_details: input.businessDetails,
    };

    const response = await fetch(`${this.baseUrl}/merchants`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const msg = data?.message || data?.error_msg || `Cashfree Partner API request failed (${response.status})`;
      logger.error("Cashfree partner merchant creation failed", { status: response.status, data });
      throw new Error(msg);
    }

    logger.info("Successfully onboarded merchant on Cashfree Partner platform", {
      merchantId: input.merchantId,
    });

    return data;
  }

  /**
   * Get sub-merchant details and status by merchantId
   */
  async getMerchantStatus(merchantId: string): Promise<CashfreePartnerMerchantResponse> {
    const response = await fetch(`${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const msg = data?.message || data?.error_msg || `Cashfree Partner API request failed (${response.status})`;
      throw new Error(msg);
    }

    return data;
  }

  /**
   * Generate or fetch Cashfree onboarding link for a sub-merchant
   */
  async getOnboardingLink(merchantId: string): Promise<string> {
    const envSubdomain = env.CASHFREE_ENV === "production" ? "merchant" : "sandbox";
    const portalUrl = `https://${envSubdomain}.cashfree.com`;

    // 1. Try Cashfree Partner Create Onboarding Link endpoint
    try {
      const response = await fetch(`${this.baseUrl}/merchants/${encodeURIComponent(merchantId)}/onboarding_link`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: "account_onboarding",
          return_url: "http://localhost:5174/merchant",
        }),
      });
      const data = (await response.json()) as any;
      if (response.ok && (data?.onboarding_link || data?.url || data?.link)) {
        return data.onboarding_link || data.url || data.link;
      }
    } catch (err: any) {
      logger.warn(`Failed to generate dynamic onboarding link for ${merchantId}: ${err.message}`);
    }

    // 2. Try fetching merchant profile from Cashfree which contains onboarding_link
    try {
      const status = await this.getMerchantStatus(merchantId);
      if (status?.onboarding_link) {
        return status.onboarding_link;
      }
    } catch (err: any) {
      logger.warn(`Failed to fetch onboarding link from merchant status for ${merchantId}: ${err.message}`);
    }

    // 3. Fallback: Official Cashfree Merchant Portal URL (where sub-merchants log in to complete KYC)
    return portalUrl;
  }

  /**
   * Sync latest sub-merchant status from Cashfree
   */
  async syncMerchantStatus(merchantId: string): Promise<{
    cashfreeMerchantId: string;
    onboardingStatus: string;
    productStatus?: any;
    activationStatus: string;
  }> {
    const cfData = await this.getMerchantStatus(merchantId);

    let activationStatus = "PENDING";
    if (Array.isArray(cfData.product_status)) {
      const pgProduct = cfData.product_status.find(
        (p: any) => p.product_name?.toLowerCase().includes("payment") || p.product_name === "PG"
      ) || cfData.product_status[0];
      if (pgProduct?.activation_status) {
        activationStatus = pgProduct.activation_status;
      }
    }

    const overallStatus = activationStatus === "ACTIVE"
      ? "ACTIVE"
      : ((cfData.onboarding_status as string) || (cfData.merchant_status as string) || "PENDING");

    return {
      cashfreeMerchantId: merchantId,
      onboardingStatus: (cfData.onboarding_status as string) || "PENDING",
      productStatus: cfData.product_status,
      activationStatus: overallStatus,
    };
  }
}

export const cashfreePartnerService = new CashfreePartnerService();
