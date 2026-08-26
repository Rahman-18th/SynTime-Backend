import type { Request, Response } from "express";
import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";
import { calculateDistanceMeters, } from "../utils/distance.js";
import {
  determineAttendanceStatus,
  isScheduleToday, getTodayWorkDate,
} from "../utils/attendance-time.js";

import {
  clockInAttendance,
  clockOutAttendance,
  getAllAttendances,
  getAttendanceById,
  getAttendanceBySchedule,
  getScheduleForAttendance,
  getTodayScheduleByEmployee,
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
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId = req.user?.employeeId;

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
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required",
      });
    }

    const parsedEmployeeId =
      BigInt(employeeId);

    const today =
      getTodayWorkDate();

    const schedule =
      await getTodayScheduleByEmployee(
        parsedEmployeeId,
        today
      );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message:
          "No schedule found for today",
      });
    }

    if (schedule.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message:
          "Attendance cannot be created for this schedule",
      });
    }

    if (schedule.attendance) {
      return res.status(409).json({
        success: false,
        message:
          "Employee has already clocked in today",
      });
    }

    if (
      schedule.office.latitude === null ||
      schedule.office.longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Office location is not configured",
      });
    }

    const employeeLatitude =
      Number(latitude);

    const employeeLongitude =
      Number(longitude);

    if (
      Number.isNaN(employeeLatitude) ||
      Number.isNaN(employeeLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers",
      });
    }

    if (
      employeeLatitude < -90 ||
      employeeLatitude > 90 ||
      employeeLongitude < -180 ||
      employeeLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude or longitude is out of range",
      });
    }

    const officeLatitude =
      Number(schedule.office.latitude);

    const officeLongitude =
      Number(schedule.office.longitude);

    const distanceMeters =
      calculateDistanceMeters(
        employeeLatitude,
        employeeLongitude,
        officeLatitude,
        officeLongitude
      );

    const allowedRadius =
      schedule.office.allowedRadiusMeters;

    if (distanceMeters > allowedRadius) {
      return res.status(403).json({
        success: false,
        message:
          "You are outside the allowed office radius",
        data: {
          distanceMeters:
            Math.round(distanceMeters * 100) /
            100,

          allowedRadiusMeters:
            allowedRadius,
        },
      });
    }

    const now = new Date();

    const attendanceStatus =
      determineAttendanceStatus(
        now,
        schedule.workDate,
        schedule.shift.startTime
      );

    const attendance =
      await clockInAttendance({
        scheduleId: schedule.id,
        checkInAt: now,
        status: attendanceStatus,
        checkInLatitude:
          employeeLatitude,
        checkInLongitude:
          employeeLongitude,
        checkInDistanceMeters:
          distanceMeters,
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
        message:
          "Request body is required",
      });
    }

    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required",
      });
    }

    const today =
      getTodayWorkDate();

    const schedule =
      await getTodayScheduleByEmployee(
        BigInt(employeeId),
        today
      );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message:
          "No schedule found for today",
      });
    }

    const attendance =
      schedule.attendance;

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Employee has not clocked in today",
      });
    }

    if (attendance.checkOutAt) {
      return res.status(409).json({
        success: false,
        message:
          "Employee has already clocked out",
      });
    }

    if (
      schedule.office.latitude === null ||
      schedule.office.longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Office location is not configured",
      });
    }

    const employeeLatitude =
      Number(latitude);

    const employeeLongitude =
      Number(longitude);

    if (
      Number.isNaN(employeeLatitude) ||
      Number.isNaN(employeeLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers",
      });
    }

    if (
      employeeLatitude < -90 ||
      employeeLatitude > 90 ||
      employeeLongitude < -180 ||
      employeeLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude or longitude is out of range",
      });
    }

    const officeLatitude =
      Number(schedule.office.latitude);

    const officeLongitude =
      Number(schedule.office.longitude);

    const distanceMeters =
      calculateDistanceMeters(
        employeeLatitude,
        employeeLongitude,
        officeLatitude,
        officeLongitude
      );

    const allowedRadius =
      schedule.office.allowedRadiusMeters;

    if (distanceMeters > allowedRadius) {
      return res.status(403).json({
        success: false,
        message:
          "You are outside the allowed office radius",
        data: {
          distanceMeters:
            Math.round(distanceMeters * 100) /
            100,

          allowedRadiusMeters:
            allowedRadius,
        },
      });
    }

    const updatedAttendance =
      await clockOutAttendance(
        attendance.id,
        {
          checkOutAt: new Date(),
          checkOutLatitude:
            employeeLatitude,
          checkOutLongitude:
            employeeLongitude,
          checkOutDistanceMeters:
            distanceMeters,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Clock out successful",
      data: serializeBigInt(
        updatedAttendance
      ),
    });
  } catch (error) {
    console.error(
      "Clock out error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}