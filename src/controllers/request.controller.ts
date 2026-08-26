import type { Request, Response } from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createRequest,
  getAllRequests,
  getRequestById,
  getRequestsByEmployee,
  reviewRequest,
} from "../services/request.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

import {
  createNotification,
} from "../services/notification.service.js";

import {
  createRequestAttachment,
  getAttachmentsByRequest,
} from "../services/request-attachment.service.js";

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

export async function index(
  req: Request,
  res: Response
) {
  try {
    const requests = await getAllRequests();

    return res.status(200).json({
      success: true,
      data: serializeBigInt(requests),
    });
  } catch (error) {
    console.error("Get requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id = parseId(req.params.id);

    const request = await getRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInt(request),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    console.error("Get request error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function myRequests(
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

    const requests =
      await getRequestsByEmployee(
        BigInt(employeeId)
      );

    return res.status(200).json({
      success: true,
      data: serializeBigInt(requests),
    });
  } catch (error) {
    console.error(
      "Get employee requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function store(
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

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      type,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !type ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "type, startDate, endDate and reason are required",
      });
    }

    const allowedTypes = [
      "leave",
      "permission",
      "attendance_correction",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type",
      });
    }

    const parsedStartDate =
      new Date(startDate);

    const parsedEndDate =
      new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request date",
      });
    }

    if (
      parsedEndDate.getTime() <
      parsedStartDate.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "endDate cannot be earlier than startDate",
      });
    }

    const request = await createRequest({
      employeeId: BigInt(employeeId),
      type,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      reason,
    });

    return res.status(201).json({
      success: true,
      message:
        "Request submitted successfully",
      data: serializeBigInt(request),
    });
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid employee reference",
        });
      }
    }

    console.error("Create request error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function review(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = parseId(req.params.id);

    const reviewerId =
      req.user?.userId;

    if (!reviewerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      status,
      reviewNote,
    } = req.body;

    const allowedStatuses = [
      "approved",
      "rejected",
    ];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be approved or rejected",
      });
    }

    const existingRequest =
      await getRequestById(id);

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      existingRequest.status !== "pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Request has already been reviewed",
      });
    }

    const updatedRequest =
      await reviewRequest(id, {
        reviewedBy:
          BigInt(reviewerId),

        status,

        reviewedAt:
          new Date(),

        ...(reviewNote !== undefined && {
          reviewNote,
        }),
      });

      const notificationTitle =
  status === "approved"
    ? "Request Approved"
    : "Request Rejected";

const notificationMessage =
  status === "approved"
    ? `Your ${existingRequest.type} request has been approved.`
    : `Your ${existingRequest.type} request has been rejected.`;

await createNotification({
  employeeId:
    existingRequest.employeeId,

  title:
    notificationTitle,

  message:
    notificationMessage,

  type:
    "request_review",
});

    return res.status(200).json({
      success: true,
      message:
        `Request ${status} successfully`,
      data:
        serializeBigInt(updatedRequest),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    if (isPrismaKnownError(error)) {
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }
    }

    console.error(
      "Review request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function addAttachment(
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

    const requestId =
      parseId(req.params.id);

    const request =
      await getRequestById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      request.employeeId !== BigInt(employeeId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot add attachments to this request",
      });
    }

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request body is required",
      });
    }

    const {
      fileName,
      fileUrl,
      fileType,
      fileSize,
    } = req.body;

    if (!fileName || !fileUrl) {
      return res.status(400).json({
        success: false,
        message:
          "fileName and fileUrl are required",
      });
    }

    const attachment =
      await createRequestAttachment({
        requestId,
        fileName,
        fileUrl,

        ...(fileType !== undefined && {
          fileType,
        }),

        ...(fileSize !== undefined && {
          fileSize: BigInt(fileSize),
        }),
      });

    return res.status(201).json({
      success: true,
      message:
        "Attachment added successfully",
      data: serializeBigInt(attachment),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request ID",
      });
    }

    console.error(
      "Add request attachment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}

export async function attachments(
  req: AuthRequest,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

    const request =
      await getRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const roles =
      req.user?.roles ?? [];

    const employeeId =
      req.user?.employeeId;

    const isAdminOrHr =
      roles.includes("admin") ||
      roles.includes("hr");

    const isOwner =
      employeeId !== null &&
      employeeId !== undefined &&
      request.employeeId ===
        BigInt(employeeId);

    if (!isAdminOrHr && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view these attachments",
      });
    }

    const data =
      await getAttachmentsByRequest(id);

    return res.status(200).json({
      success: true,
      data: serializeBigInt(data),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request ID",
      });
    }

    console.error(
      "Get request attachments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}