import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import type { Prisma } from "@prisma/client";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register a new merchant user
 */
export async function registerUser(input: RegisterInput) {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  if (name.length < 2) {
    throw new Error("Name must contain at least 2 characters");
  }

  if (name.length > 100) {
    throw new Error("Name is too long");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  if (password.length > 100) {
    throw new Error("Password is too long");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "MERCHANT",
        },
      });

      const merchant = await tx.merchant.create({
        data: {
          userId: user.id,
          businessName: `${name}'s Business`,
          businessType: "OTHER",
          phone: "",
          status: "PENDING",
        },
      });

      return {
        user,
        merchant,
      };
    }
  );

  const token = generateToken({
    userId: result.user.id,
    role: result.user.role,
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

/**
 * Login merchant user
 */
export async function loginUser(input: LoginInput) {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      merchant: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
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