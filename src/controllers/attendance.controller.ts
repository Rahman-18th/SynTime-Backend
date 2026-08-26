import type { Request, Response } from "express";

import {
  clockInAttendance,
  clockOutAttendance,
  getAllAttendances,
  getAttendanceById,
  getAttendanceBySchedule,
  getScheduleForAttendance,
} from "../services/attendance.service.js";

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
    const attendances = await getAllAttendances();

    return res.status(200).json({
      success: true,
      data: serializeBigInt(attendances),
    });
  } catch (error) {
    console.error(
      "Get attendances error:",
      error
    );

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

    const attendance =
      await getAttendanceById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInt(attendance),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
    }

    console.error(
      "Get attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function clockIn(
  req: Request,
  res: Response
) {
  try {
    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "scheduleId is required",
      });
    }

    const parsedScheduleId =
      BigInt(scheduleId);

    const schedule =
      await getScheduleForAttendance(
        parsedScheduleId
      );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    if (schedule.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message:
          "Attendance cannot be created for this schedule",
      });
    }

    const existingAttendance =
      await getAttendanceBySchedule(
        parsedScheduleId
      );

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Employee has already clocked in for this schedule",
      });
    }

    const now = new Date();

    /*
     * Untuk sementara status kita set present.
     * Nanti kita upgrade supaya backend
     * menentukan present / late berdasarkan shift.
     */
    const attendance =
      await clockInAttendance({
        scheduleId: parsedScheduleId,
        checkInAt: now,
        status: "present",
      });

    return res.status(201).json({
      success: true,
      message: "Clock in successful",
      data: serializeBigInt(attendance),
    });
  } catch (error) {
    console.error("Clock in error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function clockOut(
  req: Request,
  res: Response
) {
  try {
    const id = parseId(req.params.id);

    const attendance =
      await getAttendanceById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    if (!attendance.checkInAt) {
      return res.status(400).json({
        success: false,
        message:
          "Employee has not clocked in yet",
      });
    }

    if (attendance.checkOutAt) {
      return res.status(409).json({
        success: false,
        message:
          "Employee has already clocked out",
      });
    }

    const updatedAttendance =
      await clockOutAttendance(
        id,
        new Date()
      );

    return res.status(200).json({
      success: true,
      message: "Clock out successful",
      data: serializeBigInt(
        updatedAttendance
      ),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
    }

    console.error(
      "Clock out error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}