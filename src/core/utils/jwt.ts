import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types";

export interface JwtPayload {
  userId: string;
  email?: string;
  role: string;
  merchantId?: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
