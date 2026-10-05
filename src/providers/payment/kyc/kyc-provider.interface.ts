export type KycVerificationStatus =
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED";

export interface KycProvider {
  /**
   * KYC provider name
   */
  readonly name: string;

  /**
   * Submit merchant KYC verification
   */
  submitVerification(input: {
    merchantId: string;
    referenceId?: string;
  }): Promise<{
    providerReference: string;
    status: KycVerificationStatus;
    reason?: string;
  }>;

  /**
   * Check existing KYC verification status
   */
  checkVerification(
    providerReference: string
  ): Promise<{
    status: KycVerificationStatus;
    reason?: string;
  }>;
}