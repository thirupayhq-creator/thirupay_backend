import {
  KycProvider,
  KycVerificationStatus,
} from "./kyc-provider.interface";

interface SubmitVerificationInput {
  merchantId: string;
  referenceId?: string;
}

interface SubmitVerificationResult {
  providerReference: string;
  status: KycVerificationStatus;
  reason?: string;
}

interface CheckVerificationResult {
  status: KycVerificationStatus;
  reason?: string;
}

export class MockKycProvider implements KycProvider {
  readonly name = "MOCK_KYC";

  /**
   * Submit merchant KYC verification.
   */
  async submitVerification(
    input: SubmitVerificationInput
  ): Promise<SubmitVerificationResult> {
    const merchantId =
      input.merchantId?.trim();

    const referenceId =
      input.referenceId?.trim();

    if (!merchantId) {
      throw new Error("Merchant ID is required");
    }

    const providerReference =
      referenceId ||
      `mock_kyc_${Date.now()}_${merchantId}`;

    return {
      providerReference,
      status: "SUBMITTED",
    };
  }

  /**
   * Check KYC verification status.
   *
   * Mock behaviour:
   * - Valid MOCK_KYC reference -> VERIFIED
   * - Invalid reference -> REJECTED
   *
   * Replace this implementation with a real
   * KYC provider integration in production.
   */
  async checkVerification(
    providerReference: string
  ): Promise<CheckVerificationResult> {
    const reference =
      providerReference?.trim();

    if (!reference) {
      throw new Error(
        "KYC provider reference is required"
      );
    }

    if (reference.startsWith("mock_kyc_")) {
      return {
        status: "VERIFIED",
      };
    }

    return {
      status: "REJECTED",
      reason:
        "Invalid KYC provider reference",
    };
  }
}