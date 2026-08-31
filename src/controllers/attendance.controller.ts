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

export async function index(
  req: Request,
  res: Response
) {
  try {
    const attendances =
      await getAllAttendances();

    return successResponse(
      res,
      200,
      "Attendances retrieved successfully",
      serializeBigInt(attendances)
    );
  } catch (error) {
    console.error(
      "Get attendances error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
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
      return errorResponse(
        res,
        404,
        "Attendance not found"
      );
    }

    return successResponse(
      res,
      200,
      "Attendance retrieved successfully",
      serializeBigInt(attendance)
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid attendance ID"
      );
    }

    console.error(
      "Get attendance error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function clockIn(
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

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
    }

    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return errorResponse(
        res,
        400,
        "latitude and longitude are required"
      );
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
      return errorResponse(
        res,
        404,
        "No schedule found for today"
      );
    }

    if (
      schedule.status !== "scheduled"
    ) {
      return errorResponse(
        res,
        400,
        "Attendance cannot be created for this schedule"
      );
    }

    if (schedule.attendance) {
      return errorResponse(
        res,
        409,
        "Employee has already clocked in today"
      );
    }

    if (
      schedule.office.latitude === null ||
      schedule.office.longitude === null
    ) {
      return errorResponse(
        res,
        400,
        "Office location is not configured"
      );
    }

    const employeeLatitude =
      Number(latitude);

    const employeeLongitude =
      Number(longitude);

    if (
      Number.isNaN(employeeLatitude) ||
      Number.isNaN(employeeLongitude)
    ) {
      return errorResponse(
        res,
        400,
        "Latitude and longitude must be valid numbers"
      );
    }

    if (
      employeeLatitude < -90 ||
      employeeLatitude > 90 ||
      employeeLongitude < -180 ||
      employeeLongitude > 180
    ) {
      return errorResponse(
        res,
        400,
        "Latitude or longitude is out of range"
      );
    }

    const officeLatitude =
      Number(
        schedule.office.latitude
      );

    const officeLongitude =
      Number(
        schedule.office.longitude
      );

    const distanceMeters =
      calculateDistanceMeters(
        employeeLatitude,
        employeeLongitude,
        officeLatitude,
        officeLongitude
      );

    const allowedRadius =
      schedule.office.allowedRadiusMeters;

    if (
      distanceMeters >
      allowedRadius
    ) {
      return errorResponse(
  res,
  403,
  "You are outside the allowed office radius",
  {
    distanceMeters:
      Math.round(distanceMeters * 100) / 100,
    allowedRadiusMeters:
      allowedRadius,
  }
);
    }

    const now =
      new Date();

    const attendanceStatus =
      determineAttendanceStatus(
        now,
        schedule.workDate,
        schedule.shift.startTime
      );

    const attendance =
      await clockInAttendance({
        scheduleId:
          schedule.id,

        checkInAt:
          now,

        status:
          attendanceStatus,

        checkInLatitude:
          employeeLatitude,

        checkInLongitude:
          employeeLongitude,

        checkInDistanceMeters:
          distanceMeters,
      });

    return successResponse(
      res,
      201,
      "Clock in successful",
      serializeBigInt(attendance)
    );
  } catch (error) {
    console.error(
      "Clock in error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
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
      return errorResponse(
        res,
        403,
        "This user is not linked to an employee"
      );
    }

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
    }

    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return errorResponse(
        res,
        400,
        "latitude and longitude are required"
      );
    }

    const today =
      getTodayWorkDate();

    const schedule =
      await getTodayScheduleByEmployee(
        BigInt(employeeId),
        today
      );

    if (!schedule) {
      return errorResponse(
        res,
        404,
        "No schedule found for today"
      );
    }

    const attendance =
      schedule.attendance;

    if (!attendance) {
      return errorResponse(
        res,
        404,
        "Employee has not clocked in today"
      );
    }

    if (
      attendance.checkOutAt
    ) {
      return errorResponse(
        res,
        409,
        "Employee has already clocked out"
      );
    }

    if (
      schedule.office.latitude === null ||
      schedule.office.longitude === null
    ) {
      return errorResponse(
        res,
        400,
        "Office location is not configured"
      );
    }

    const employeeLatitude =
      Number(latitude);

    const employeeLongitude =
      Number(longitude);

    if (
      Number.isNaN(employeeLatitude) ||
      Number.isNaN(employeeLongitude)
    ) {
      return errorResponse(
        res,
        400,
        "Latitude and longitude must be valid numbers"
      );
    }

    if (
      employeeLatitude < -90 ||
      employeeLatitude > 90 ||
      employeeLongitude < -180 ||
      employeeLongitude > 180
    ) {
      return errorResponse(
        res,
        400,
        "Latitude or longitude is out of range"
      );
    }

    const officeLatitude =
      Number(
        schedule.office.latitude
      );

    const officeLongitude =
      Number(
        schedule.office.longitude
      );

    const distanceMeters =
      calculateDistanceMeters(
        employeeLatitude,
        employeeLongitude,
        officeLatitude,
        officeLongitude
      );

    const allowedRadius =
      schedule.office.allowedRadiusMeters;

    if (
      distanceMeters >
      allowedRadius
    ) {
      return errorResponse(
        res,
        403,
        `You are outside the allowed office radius. Distance: ${
          Math.round(
            distanceMeters * 100
          ) / 100
        }m, allowed: ${allowedRadius}m`
      );
    }

    const updatedAttendance =
      await clockOutAttendance(
        attendance.id,
        {
          checkOutAt:
            new Date(),

          checkOutLatitude:
            employeeLatitude,

          checkOutLongitude:
            employeeLongitude,

          checkOutDistanceMeters:
            distanceMeters,
        }
      );

    return successResponse(
      res,
      200,
      "Clock out successful",
      serializeBigInt(
        updatedAttendance
      )
    );
  } catch (error) {
    console.error(
      "Clock out error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}