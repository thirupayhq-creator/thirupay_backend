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
const jwtSecret = requiredEnv("JWT_SECRET");
const cashfreeWebhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || "";

export const env = {
  // Server
  PORT: port,
  port,
  NODE_ENV: process.env.NODE_ENV || "development",

  // PostgreSQL
  DATABASE_URL: requiredEnv("DATABASE_URL"),

  // JWT
  JWT_SECRET: jwtSecret,
  jwtSecret,

  // Cashfree
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || "",
  CASHFREE_SECRET_KEY:
    process.env.CASHFREE_SECRET_KEY || "",
  CASHFREE_WEBHOOK_SECRET: cashfreeWebhookSecret,
  cashfreeWebhookSecret,

  CASHFREE_API_URL:
    process.env.CASHFREE_API_URL ||
    "https://sandbox.cashfree.com/pg",

  CASHFREE_ENV:
    process.env.CASHFREE_ENV || "sandbox",
};