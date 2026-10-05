export interface SmsProvider {
  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Send OTP
   */
  sendOtp(input: {
    phone: string;
    otp: string;
    message?: string;
  }): Promise<{
    success: boolean;
    providerReference?: string;
  }>;

  /**
   * Send SMS message
   */
  sendMessage(input: {
    phone: string;
    message: string;
  }): Promise<{
    success: boolean;
    providerReference?: string;
  }>;
}