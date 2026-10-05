import { Request } from "express";

export interface AuthUser {
  userId: string;
  role: string;
  email?: string;
  merchantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: Buffer;
    }
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
