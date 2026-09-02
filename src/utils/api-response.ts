import type { Response } from "express";

function serializeBigInt(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [
          key,
          serializeBigInt(item),
        ],
      ),
    );
  }

  return value;
}

export function successResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && {
      data: serializeBigInt(data),
    }),
  });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data !== undefined && {
      data: serializeBigInt(data),
    }),
  });
}