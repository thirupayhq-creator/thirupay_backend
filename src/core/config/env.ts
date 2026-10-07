import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "tiru-pay-development-jwt-secret-replace-in-production";

// Environment mode for Cashfree: 'sandbox' or 'production'
const cashfreeEnv = (
  process.env.CASHFREE_ENV ||
  process.env.CASHFREE_ENVIRONMENT ||
  "sandbox"
).trim().toLowerCase() as "sandbox" | "production";

export const env = {
  // Server
  PORT: port,
  port,
  NODE_ENV: process.env.NODE_ENV || "development",

  // PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tiru_pay?schema=public",

  // JWT
  JWT_SECRET: jwtSecret,
  jwtSecret,

  // Payment Provider ('CASHFREE' or 'MOCK')
  PAYMENT_PROVIDER: (process.env.PAYMENT_PROVIDER || "CASHFREE").trim().toUpperCase(),

  // Cashfree Configuration (Supports Sandbox & Production)
  CASHFREE_ENV: cashfreeEnv,
  CASHFREE_ENVIRONMENT: cashfreeEnv,
  CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_APP_ID || "",
  CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY || "",
  CASHFREE_PARTNER_API_KEY: process.env.CASHFREE_PARTNER_API_KEY || "",
  CASHFREE_API_VERSION: process.env.CASHFREE_API_VERSION || "2023-08-01",
  CASHFREE_WEBHOOK_SECRET: process.env.CASHFREE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "",
  cashfreeWebhookSecret: process.env.CASHFREE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "",
  CASHFREE_API_URL:
    process.env.CASHFREE_API_URL ||
    (cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg"),
  CASHFREE_PARTNER_API_URL:
    process.env.CASHFREE_PARTNER_API_URL ||
    (cashfreeEnv === "production"
      ? "https://api.cashfree.com/partners"
      : "https://api-sandbox.cashfree.com/partners"),
  CASHFREE_RETURN_URL:
    process.env.CASHFREE_RETURN_URL || "http://localhost:3000/payment/success?order_id={order_id}",
  CASHFREE_WEBHOOK_URL:
    process.env.CASHFREE_WEBHOOK_URL || "http://localhost:5000/api/v1/webhooks/payment",

  // Default Fallbacks
  DEFAULT_CUSTOMER_PHONE: process.env.DEFAULT_CUSTOMER_PHONE || "9999999999",

  // Providers
  SMS_PROVIDER: process.env.SMS_PROVIDER || "MOCK",
  KYC_PROVIDER: process.env.KYC_PROVIDER || "MOCK",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
