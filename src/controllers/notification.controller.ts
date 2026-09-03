import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createNotification,
  getAllNotifications,
  getNotificationsByEmployee,
  markNotificationAsRead,
} from "../services/notification.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

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

/*
|--------------------------------------------------------------------------
| Admin - Get All Notifications
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const notifications =
      await getAllNotifications();

    return successResponse(
      res,
      200,
      "Notifications retrieved successfully",
      notifications
    );
  } catch (error) {
    console.error(
      "Get all notifications error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Admin - Create Notification
|--------------------------------------------------------------------------
*/

export async function store(
  req: Request,
  res: Response
) {
  try {
    const {
      employeeId,
      title,
      message,
      type,
    } = req.body ?? {};

    if (
      !employeeId ||
      !title ||
      !message
    ) {
      return errorResponse(
        res,
        400,
        "employeeId, title and message are required"
      );
    }

    const parsedEmployeeId =
      BigInt(employeeId);

    const notification =
      await createNotification({
        employeeId:
          parsedEmployeeId,

        title:
          String(title).trim(),

        message:
          String(message).trim(),

        type:
          type !== undefined &&
          String(type).trim()
            ? String(type).trim()
            : "manual",
      });

    return successResponse(
      res,
      201,
      "Notification created successfully",
      notification
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid employee reference"
        );
      }
    }

    if (
      error instanceof SyntaxError
    ) {
      return errorResponse(
        res,
        400,
        "Invalid employee ID"
      );
    }

    console.error(
      "Create notification error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Employee - My Notifications
|--------------------------------------------------------------------------
*/

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
      notifications
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

/*
|--------------------------------------------------------------------------
| Employee - Mark As Read
|--------------------------------------------------------------------------
*/

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