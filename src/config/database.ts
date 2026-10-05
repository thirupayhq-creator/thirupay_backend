import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL database connected successfully");
  } catch (error) {
    console.error("❌ PostgreSQL database connection failed");
    console.error(error);

    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();

  console.log("PostgreSQL database disconnected");
}

export default prisma;