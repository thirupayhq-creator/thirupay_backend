import app from "./app";
import { connectDatabase, disconnectDatabase } from "./core/config/database";
import { env } from "./core/config/env";
import { logger } from "./core/config/logger";

let server: ReturnType<typeof app.listen> | undefined;

async function startServer() {
  try {
    console.log("==========================================");
    console.log("🚀 Starting TIRU PAY Backend API");
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`💳 Payment Provider: ${env.PAYMENT_PROVIDER}`);
    console.log(`⚡ Cashfree Mode: ${env.CASHFREE_ENV.toUpperCase()}`);
    console.log("==========================================");

    // Test database connection (warns if down, but lets server start for health checks)
    const isDbConnected = await connectDatabase();
    if (!isDbConnected) {
      console.warn("⚠️ Database connection failed on startup. Update DATABASE_URL in .env to connect.");
    }

    server = app.listen(env.PORT, () => {
      logger.info(`TIRU PAY running on http://localhost:${env.PORT}`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
    });

    server.on("error", (error) => {
      logger.error("TIRU PAY HTTP server error:", error);
    });
  } catch (error) {
    logger.error("Failed to start TIRU PAY:", error);
    await disconnectDatabase();
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      logger.info("HTTP server stopped");
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    await disconnectDatabase();
    process.exit(1);
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  void shutdown("UNCAUGHT_EXCEPTION");
});

void startServer();