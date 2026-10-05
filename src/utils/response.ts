import { Response } from "express";

/**
 * Standard successful API response.
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message = "Request successful",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard error API response.
 */
export function errorResponse(
  res: Response,
  message = "Request failed",
  statusCode = 400,
  errors?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined
      ? { errors }
      : {}),
  });
}

/**
 * Standard paginated API response.
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = "Request successful"
) {
  const normalizedPage =
    Number.isFinite(page) && page > 0
      ? Math.floor(page)
      : 1;

  const normalizedLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : 10;

  const normalizedTotal =
    Number.isFinite(total) && total >= 0
      ? Math.floor(total)
      : 0;

  const totalPages =
    normalizedTotal === 0
      ? 0
      : Math.ceil(
          normalizedTotal / normalizedLimit
        );

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: normalizedTotal,
      totalPages,
      hasNextPage:
        normalizedPage < totalPages,
      hasPreviousPage:
        normalizedPage > 1 &&
        normalizedTotal > 0,
    },
  });
}