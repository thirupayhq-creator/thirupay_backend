import app from "./app";
import prisma from "./config/database";
import { env } from "./config/env";

let server: ReturnType<typeof app.listen> | undefined;

async function startServer() {
  try {
    /**
     * ==========================================
     * DATABASE CONNECTION
     * ==========================================
     */
    await prisma.$connect();

    console.log("PostgreSQL connected");

    /**
     * ==========================================
     * START HTTP SERVER
     * ==========================================
     */
    server = app.listen(env.PORT, () => {
      console.log(
        `TIRU PAY running on http://localhost:${env.PORT}`
      );
      console.log(
        `Health check: http://localhost:${env.PORT}/health`
      );
    });

    /**
     * Handle server-level errors.
     */
    server.on("error", (error) => {
      console.error(
        "TIRU PAY server error:",
        error
      );
    });
  } catch (error) {
    console.error(
      "Failed to start TIRU PAY:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  }
}

/**
 * ==========================================
 * GRACEFUL SHUTDOWN
 * ==========================================
 */
async function shutdown(
  signal: string
) {
  console.log(
    `${signal} received. Shutting down TIRU PAY...`
  );

  try {
    /**
     * Stop accepting new HTTP connections.
     */
    if (server) {
      await new Promise<void>(
        (resolve, reject) => {
          server?.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }
      );

      console.log(
        "HTTP server stopped"
      );
    }

    /**
     * Close PostgreSQL connection.
     */
    await prisma.$disconnect();

    console.log(
      "PostgreSQL disconnected"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Error during shutdown:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  }
}

/**
 * ==========================================
 * PROCESS SIGNALS
 * ==========================================
 */
process.once(
  "SIGINT",
  () => {
    void shutdown("SIGINT");
  }
);

process.once(
  "SIGTERM",
  () => {
    void shutdown("SIGTERM");
  }
);

/**
 * ==========================================
 * UNHANDLED ERRORS
 * ==========================================
 */
process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled promise rejection:",
      reason
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    void shutdown(
      "UNCAUGHT_EXCEPTION"
    );
  }
);

/**
 * ==========================================
 * START APPLICATION
 * ==========================================
 */
void startServer();