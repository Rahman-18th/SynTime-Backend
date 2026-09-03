import type {
  Response,
} from "express";

function serializeValue(
  value: unknown
): unknown {
  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const candidate =
      value as {
        toNumber?: () => number;
        constructor?: {
          name?: string;
        };
      };

    if (
      candidate.constructor?.name ===
        "Decimal" &&
      typeof candidate.toNumber ===
        "function"
    ) {
      return candidate.toNumber();
    }

    if (Array.isArray(value)) {
      return value.map(
        serializeValue
      );
    }

    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          serializeValue(
            nestedValue
          ),
        ]
      )
    );
  }

  return value;
}

export function successResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
) {
  return res
    .status(statusCode)
    .json({
      success: true,
      message,
      ...(data !== undefined && {
        data:
          serializeValue(data),
      }),
    });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
) {
  return res
    .status(statusCode)
    .json({
      success: false,
      message,
      ...(errors !== undefined && {
        errors:
          serializeValue(errors),
      }),
    });
}