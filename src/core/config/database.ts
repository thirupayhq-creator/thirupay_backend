import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error", "warn"],
});

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    // Test query
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ PostgreSQL database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL database connection failed");
    if (error instanceof Error) {
      console.error(`Reason: ${error.message}`);
    } else {
      console.error(error);
    }
    return false;
  }
}

export async function checkDatabaseHealth(): Promise<{ status: "UP" | "DOWN"; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "UP" };
  } catch (err) {
    return { status: "DOWN", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log("PostgreSQL database disconnected");
}

export { prisma };
export default prisma;
