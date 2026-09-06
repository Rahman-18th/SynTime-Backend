import type {
  Request,
  Response,
} from "express";

import {
  getAuditLogs,
} from "../services/audit-log.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

function parsePositiveInteger(
  value: unknown,
  fieldName: string
): number | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `INVALID_${fieldName.toUpperCase()}`
    );
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `INVALID_${fieldName.toUpperCase()}`
    );
  }

  return parsed;
}

function parseDate(
  value: unknown
): Date | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "INVALID_DATE"
    );
  }

  const pattern =
    /^\d{4}-\d{2}-\d{2}$/;

  if (!pattern.test(value)) {
    throw new Error(
      "INVALID_DATE"
    );
  }

  const parts = value
    .split("-")
    .map(Number);

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (
    year === undefined ||
    month === undefined ||
    day === undefined
  ) {
    throw new Error("INVALID_DATE");
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw new Error(
      "INVALID_DATE"
    );
  }

  return date;
}

export async function index(
  req: Request,
  res: Response
) {
  try {
    const page =
      parsePositiveInteger(
        req.query.page,
        "page"
      );

    const limit =
      parsePositiveInteger(
        req.query.limit,
        "limit"
      );

    if (
      limit !== undefined &&
      limit > 100
    ) {
      return errorResponse(
        res,
        400,
        "Limit cannot exceed 100"
      );
    }

    const search =
      typeof req.query.search ===
      "string"
        ? req.query.search.trim()
        : undefined;

    const action =
      typeof req.query.action ===
      "string"
        ? req.query.action.trim()
        : undefined;

    const entityType =
      typeof req.query.entityType ===
      "string"
        ? req.query.entityType.trim()
        : undefined;

    const dateFrom =
      parseDate(
        req.query.dateFrom
      );

    const dateToRaw =
      parseDate(
        req.query.dateTo
      );

    const dateTo =
      dateToRaw
        ? new Date(
            dateToRaw.getTime() +
              24 *
                60 *
                60 *
                1000
          )
        : undefined;

    const result =
      await getAuditLogs({
        ...(page !==
          undefined && {
          page,
        }),

        ...(limit !==
          undefined && {
          limit,
        }),

        ...(search && {
          search,
        }),

        ...(action && {
          action,
        }),

        ...(entityType && {
          entityType,
        }),

        ...(dateFrom && {
          dateFrom,
        }),

        ...(dateTo && {
          dateTo,
        }),
      });

    const totalPages =
      result.paginationEnabled
        ? Math.ceil(
            result.total /
              result.limit
          )
        : result.total > 0
          ? 1
          : 0;

    return successResponse(
      res,
      200,
      "Audit logs retrieved successfully",
      result.items,
      {
        page:
          result.paginationEnabled
            ? result.page
            : 1,

        limit:
          result.paginationEnabled
            ? result.limit
            : result.total,

        total:
          result.total,

        totalPages,

        hasNextPage:
          result.paginationEnabled &&
          result.page <
            totalPages,

        hasPreviousPage:
          result.paginationEnabled &&
          result.page > 1,
      }
    );
  } catch (error) {
    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "INVALID_PAGE"
      ) {
        return errorResponse(
          res,
          400,
          "Page must be a positive integer"
        );
      }

      if (
        error.message ===
        "INVALID_LIMIT"
      ) {
        return errorResponse(
          res,
          400,
          "Limit must be a positive integer"
        );
      }

      if (
        error.message ===
        "INVALID_DATE"
      ) {
        return errorResponse(
          res,
          400,
          "Invalid date. Use YYYY-MM-DD."
        );
      }
    }

    console.error(
      "Get audit logs error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}