import express from "express";
import cors from "cors";
import helmet from "helmet";

// Vertical Slice Routes
import authRoutes from "./modules/auth/auth.routes";
import merchantRoutes from "./modules/merchant/merchant.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import refundRoutes from "./modules/refund/refund.routes";
import payoutRoutes from "./modules/payout/payout.routes";
import webhookRoutes from "./modules/webhook/webhook.routes";

// Core Infrastructure
import { errorMiddleware } from "./core/middleware/error.middleware";
import { checkDatabaseHealth } from "./core/config/database";

const app = express();

/**
 * ==========================================
 * SECURITY & HEADERS
 * ==========================================
 */
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/**
 * ==========================================
 * CORS
 * ==========================================
 */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/**
 * ==========================================
 * BODY PARSERS
 *
 * Captures raw body buffer in req.rawBody
 * for Cashfree Webhook HMAC-SHA256 signature verification.
 * ==========================================
 */
app.use(
  express.json({
    limit: "2mb",
    verify: (
      req: express.Request & { rawBody?: Buffer },
      _res,
      buffer
    ) => {
      req.rawBody = Buffer.from(buffer);
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/**
 * ==========================================
 * ROOT & HEALTH CHECK ROUTES
 * ==========================================
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TIRU PAY Backend API is running",
    service: "TIRU PAY",
    version: "2.0.0",
    architecture: "Vertical Slice Architecture",
  });
});

app.get("/health", async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.status === "UP";

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: "TIRU PAY",
    status: isHealthy ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
});

app.get("/api/v1/health", async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.status === "UP";

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? "HEALTHY" : "UNHEALTHY",
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth,
    },
  });
});

/**
 * ==========================================
 * VERTICAL SLICE API ROUTES
 * ==========================================
 */

// Authentication Slice (Register, Login, Me)
app.use("/api/v1/auth", authRoutes);

// Merchant Slice (Onboarding, Profile, Admin list & status)
app.use("/api/v1/merchants", merchantRoutes);

// KYC Slice (Submit, Status, Admin verify)
app.use("/api/v1/kyc", kycRoutes);

// Payment Slice (Create Cashfree order, Verify, Get, List)
app.use("/api/v1/payments", paymentRoutes);

// Refund Slice (Create refund, Status, List)
app.use("/api/v1", refundRoutes);

// Payout Slice (Initiate payout, Status, List)
app.use("/api/v1/payouts", payoutRoutes);

// Webhook Slice (Cashfree webhook verification & event processing)
app.use("/api/v1/webhooks", webhookRoutes);

/**
 * ==========================================
 * 404 NOT FOUND HANDLER
 * ==========================================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * ==========================================
 * GLOBAL ERROR HANDLER
 * ==========================================
 */
app.use(errorMiddleware);

export { app };
export default app;