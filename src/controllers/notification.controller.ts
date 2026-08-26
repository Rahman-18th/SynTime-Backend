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
      return res.status(403).json({
        success: false,
        message:
          "This user is not linked to an employee",
      });
    }

    const notifications =
      await getNotificationsByEmployee(
        BigInt(employeeId)
      );

    return res.status(200).json({
      success: true,
      data:
        serializeBigInt(notifications),
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
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
      return res.status(403).json({
        success: false,
        message:
          "This user is not linked to an employee",
      });
    }

    const id =
      parseId(req.params.id);

    const result =
      await markNotificationAsRead(
        id,
        BigInt(employeeId)
      );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification ID",
      });
    }

    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}