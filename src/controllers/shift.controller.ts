import type { Request, Response } from "express";

import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
} from "../services/shift.service.js";

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

function timeToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00`);
}

export async function index(req: Request, res: Response) {
  try {
    const shifts = await getAllShifts();

    return res.status(200).json({
      success: true,
      data: serializeBigInt(shifts),
    });
  } catch (error) {
    console.error("Get shifts error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function show(req: Request, res: Response) {
  try {
    const id = parseId(req.params.id);

    const shift = await getShiftById(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInt(shift),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid shift ID",
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
      companyId,
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
    } = req.body;

    if (!companyId || !name || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "companyId, name, startTime and endTime are required",
      });
    }

    const shift = await createShift({
      companyId: BigInt(companyId),
      name,
      startTime: timeToDate(startTime),
      endTime: timeToDate(endTime),

      ...(breakStart && {
        breakStart: timeToDate(breakStart),
      }),

      ...(breakEnd && {
        breakEnd: timeToDate(breakEnd),
      }),
    });

    return res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: serializeBigInt(shift),
    });
  } catch (error) {
    console.error("Create shift error:", error);

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
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
    } = req.body;

    const shift = await updateShift(id, {
      ...(name !== undefined && { name }),

      ...(startTime !== undefined && {
        startTime: timeToDate(startTime),
      }),

      ...(endTime !== undefined && {
        endTime: timeToDate(endTime),
      }),

      ...(breakStart !== undefined && {
        breakStart: timeToDate(breakStart),
      }),

      ...(breakEnd !== undefined && {
        breakEnd: timeToDate(breakEnd),
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      data: serializeBigInt(shift),
    });
  } catch (error) {
    console.error("Update shift error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}