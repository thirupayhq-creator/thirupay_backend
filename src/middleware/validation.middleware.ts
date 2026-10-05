import {
  Request,
  Response,
  NextFunction,
} from "express";
import { ZodSchema } from "zod";

/**
 * Generic Zod validation middleware.
 *
 * Validates:
 * - body
 * - query
 * - params
 * - headers
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues.map((issue) => ({
            field:
              issue.path.length > 0
                ? issue.path.join(".")
                : "request",
            message: issue.message,
            code: issue.code,
          })),
        });
        return;
      }

      const data = result.data as {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };

      if (data.body !== undefined) {
        req.body = data.body;
      }

      if (
        data.query !== undefined &&
        typeof data.query === "object" &&
        data.query !== null
      ) {
        Object.keys(req.query).forEach((key) => {
          delete req.query[key];
        });

        Object.assign(req.query, data.query);
      }

      if (
        data.params !== undefined &&
        typeof data.params === "object" &&
        data.params !== null
      ) {
        Object.keys(req.params).forEach((key) => {
          delete req.params[key];
        });

        Object.assign(req.params, data.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}