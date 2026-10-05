import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  email?: string;
  role: string;
  merchantId?: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET || env.jwtSecret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET || env.jwtSecret) as JwtPayload;
}