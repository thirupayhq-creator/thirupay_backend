import prisma from "../../core/config/database";
import { hashPassword, comparePassword } from "../../core/utils/password";
import { generateToken } from "../../core/utils/jwt";
import { RegisterInput, LoginInput } from "./auth.schema";
import { Prisma } from "@prisma/client";

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const businessName = input.businessName || `${input.name}'s Business`;

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: "MERCHANT",
        },
      });

      const merchant = await tx.merchant.create({
        data: {
          userId: user.id,
          businessName,
          businessType: "OTHER",
          phone: "",
          status: "PENDING",
        },
      });

      return { user, merchant };
    }
  );

  const token = generateToken({
    userId: result.user.id,
    role: result.user.role,
    email: result.user.email,
    merchantId: result.merchant.id,
  });

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
    merchant: {
      id: result.merchant.id,
      businessName: result.merchant.businessName,
      status: result.merchant.status,
    },
    token,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { merchant: true },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    merchantId: user.merchant?.id,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    merchant: user.merchant
      ? {
          id: user.merchant.id,
          businessName: user.merchant.businessName,
          status: user.merchant.status,
        }
      : null,
    token,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      merchant: {
        select: {
          id: true,
          businessName: true,
          businessType: true,
          phone: true,
          status: true,
          kyc: {
            select: {
              status: true,
              submittedAt: true,
              verifiedAt: true,
              rejectionReason: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
