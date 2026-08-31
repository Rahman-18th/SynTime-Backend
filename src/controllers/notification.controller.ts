import type {
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  getNotificationsByEmployee,
  markNotificationAsRead,
} from "../services/notification.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

function serializeBigInt(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value
    )
  );
}

function parseId(
  id: string | string[] | undefined
): bigint {
  if (!id || Array.isArray(id)) {
    throw new Error("INVALID_ID");
  }

  try {
    return BigInt(id);
  } catch {
    throw new Error("INVALID_ID");
  }
}

export async function myNotifications(
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId =
      req.user?.employeeId;

    if (!employeeId) {
      return errorResponse(
        res,
        403,
        "This user is not linked to an employee"
      );
    }

    const notifications =
      await getNotificationsByEmployee(
        BigInt(employeeId)
      );

    return successResponse(
      res,
      200,
      "Notifications retrieved successfully",
      serializeBigInt(notifications)
    );
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function markAsRead(
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId =
      req.user?.employeeId;

    if (!employeeId) {
      return errorResponse(
        res,
        403,
        "This user is not linked to an employee"
      );
    }

    const id =
      parseId(req.params.id);

    const result =
      await markNotificationAsRead(
        id,
        BigInt(employeeId)
      );

    if (result.count === 0) {
      return errorResponse(
        res,
        404,
        "Notification not found"
      );
    }

    return successResponse(
      res,
      200,
      "Notification marked as read"
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid notification ID"
      );
    }

    console.error(
      "Mark notification as read error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}