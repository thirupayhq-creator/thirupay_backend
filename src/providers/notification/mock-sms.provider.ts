import { SmsProvider } from "./sms-provider.interface";
import { logger } from "../../config/logger";

interface SendOtpInput {
  phone: string;
  otp: string;
  message?: string;
}

interface SendMessageInput {
  phone: string;
  message: string;
}

interface SmsResult {
  success: boolean;
  providerReference: string;
}

export class MockSmsProvider implements SmsProvider {
  name = "MOCK_SMS";

  /**
   * Send OTP using mock SMS provider.
   */
  async sendOtp(
    input: SendOtpInput
  ): Promise<SmsResult> {
    const phone = input.phone?.trim();
    const otp = input.otp?.trim();

    if (!phone) {
      throw new Error("Phone number is required");
    }

    if (!otp) {
      throw new Error("OTP is required");
    }

    if (!/^\d{4,8}$/.test(otp)) {
      throw new Error(
        "OTP must contain 4 to 8 digits"
      );
    }

    const providerReference =
      `mock_sms_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    /*
     * Mock provider only.
     *
     * In production, replace this implementation
     * with Twilio, MSG91, AWS SNS, etc.
     *
     * Avoid logging OTPs in production.
     */
    logger.info("Mock SMS OTP generated", {
      phone,
      providerReference,
    });

    if (process.env.NODE_ENV !== "production") {
      logger.debug("Mock SMS OTP", {
        phone,
        otp,
      });
    }

    return {
      success: true,
      providerReference,
    };
  }

  /**
   * Send normal SMS message using mock provider.
   */
  async sendMessage(
    input: SendMessageInput
  ): Promise<SmsResult> {
    const phone = input.phone?.trim();
    const message = input.message?.trim();

    if (!phone) {
      throw new Error("Phone number is required");
    }

    if (!message) {
      throw new Error("Message is required");
    }

    if (message.length > 1600) {
      throw new Error(
        "Message cannot exceed 1600 characters"
      );
    }

    const providerReference =
      `mock_sms_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    logger.info("Mock SMS message generated", {
      phone,
      providerReference,
    });

    if (process.env.NODE_ENV !== "production") {
      logger.debug("Mock SMS message", {
        phone,
        message,
      });
    }

    return {
      success: true,
      providerReference,
    };
  }
}