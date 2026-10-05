import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  console.log("==========================================");
  console.log("TIRU PAY - PostgreSQL Database Test Script");
  console.log("==========================================");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in .env!");
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  console.log(`Connecting to: ${maskedUrl}`);

  try {
    const startTime = Date.now();
    await prisma.$connect();
    const latency = Date.now() - startTime;
    console.log(`✅ Successfully connected to PostgreSQL in ${latency}ms!`);

    // Query tables
    const userCount = await prisma.user.count();
    const merchantCount = await prisma.merchant.count();
    const paymentCount = await prisma.payment.count();

    console.log("\nDatabase Table Summary:");
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Merchants: ${merchantCount}`);
    console.log(`  - Payments: ${paymentCount}`);
    console.log("\nDatabase connection and tables are healthy!");
  } catch (error) {
    console.error("\n❌ Database Connection Failed:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    console.log("\nTips:");
    console.log("  1. Verify the DATABASE_URL in your .env file is correct.");
    console.log("  2. If using a remote PostgreSQL (Neon, Supabase, etc.), ensure SSL is enabled (?sslmode=require).");
    console.log("  3. Run 'npm run db:push' to create or sync tables once connected.");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
