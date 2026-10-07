import prisma from "../src/core/config/database";
import { hashPassword } from "../src/core/utils/password";

async function main() {
  const adminEmails = [
    { email: "admin.ops@thirupay.in", name: "Operations Admin", role: "ADMIN" },
    { email: "admin@thirupay.in", name: "Super Admin", role: "ADMIN" },
    { email: "admin.compliance@thirupay.in", name: "Compliance Admin", role: "ADMIN" },
  ];

  const passwordHash = await hashPassword("admin123");

  for (const a of adminEmails) {
    const existing = await prisma.user.findUnique({ where: { email: a.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: a.name,
          email: a.email,
          passwordHash,
          role: "ADMIN",
        },
      });
      console.log(`Created admin user in DB: ${a.email}`);
    } else {
      await prisma.user.update({
        where: { email: a.email },
        data: { passwordHash, role: "ADMIN" },
      });
      console.log(`Updated admin user password in DB: ${a.email}`);
    }
  }
}

main().catch(console.error);
