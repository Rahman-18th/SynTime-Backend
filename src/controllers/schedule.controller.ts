import type { Request, Response } from "express";

import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
} from "../services/schedule.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

function serializeBigInt(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function parseId(id: string | string[] | undefined): bigint {
  if (!id || Array.isArray(id)) {
    throw new Error("INVALID_ID");
  }

  try {
    return BigInt(id);
  } catch {
    throw new Error("INVALID_ID");
  }
}

export async function index(req: Request, res: Response) {
  try {
    const schedules = await getAllSchedules();

    return res.status(200).json({
      success: true,
      data: serializeBigInt(schedules),
    });
  } catch (error) {
    console.error("Get schedules error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function show(req: Request, res: Response) {
  try {
    const id = parseId(req.params.id);

    const schedule = await getScheduleById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInt(schedule),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    console.error("Get schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function store(req: Request, res: Response) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      employeeId,
      shiftId,
      officeId,
      workDate,
      status,
    } = req.body;

    if (!employeeId || !shiftId || !officeId || !workDate) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, shiftId, officeId and workDate are required",
      });
    }

    const allowedStatuses = [
      "scheduled",
      "off",
      "holiday",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status",
      });
    }

    const schedule = await createSchedule({
      employeeId: BigInt(employeeId),
      shiftId: BigInt(shiftId),
      officeId: BigInt(officeId),
      workDate: new Date(workDate),

      ...(status !== undefined && {
        status,
      }),
    });

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: serializeBigInt(schedule),
    });
  } catch (error) {
  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Employee already has a schedule for this date",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee, shift, or office reference",
      });
    }
  }

  console.error("Create schedule error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
}

export async function update(req: Request, res: Response) {
  try {
    const id = parseId(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      employeeId,
      shiftId,
      officeId,
      workDate,
      status,
    } = req.body;

    const allowedStatuses = [
      "scheduled",
      "off",
      "holiday",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status",
      });
    }

    const scheduleData = {
      ...(employeeId !== undefined && {
        employeeId: BigInt(employeeId),
      }),

      ...(shiftId !== undefined && {
        shiftId: BigInt(shiftId),
      }),

      ...(officeId !== undefined && {
        officeId: BigInt(officeId),
      }),

      ...(workDate !== undefined && {
        workDate: new Date(workDate),
      }),

      ...(status !== undefined && {
        status,
      }),
    };

    const schedule = await updateSchedule(
      id,
      scheduleData
    );

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: serializeBigInt(schedule),
    });
  } catch (error) {
  if (
    error instanceof Error &&
    error.message === "INVALID_ID"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid schedule ID",
    });
  }

  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Employee already has a schedule for this date",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee, shift, or office reference",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }
  }

  console.error("Update schedule error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
}