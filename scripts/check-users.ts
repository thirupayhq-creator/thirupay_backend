import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      merchant: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log("=== USERS IN POSTGRESQL ===");
  users.forEach((u) => {
    console.log({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      hasPasswordHash: !!u.passwordHash,
      merchantId: u.merchant?.id,
      merchantName: u.merchant?.businessName,
      merchantStatus: u.merchant?.status,
    });
  });

  const target = await prisma.user.findFirst({
    where: { email: { equals: "shoppingmart@gmail.com", mode: "insensitive" } },
    include: { merchant: true },
  });

  console.log("\nTarget user 'shoppingmart@gmail.com':", target);
}

main().finally(() => prisma.$disconnect());
