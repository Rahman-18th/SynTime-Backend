import type { Request, Response } from "express";

import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
} from "../services/shift.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

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

function timeToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00`);
}

function handleInvalidShiftId(
  error: unknown,
  res: Response
) {
  if (
    error instanceof Error &&
    error.message === "INVALID_ID"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid shift ID",
    });

    return true;
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| GET /api/shifts
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
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

/*
|--------------------------------------------------------------------------
| GET /api/shifts/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
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
    if (handleInvalidShiftId(error, res)) {
      return;
    }

    console.error("Get shift error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/shifts
|--------------------------------------------------------------------------
*/

export async function store(
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

    const {
      companyId,
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
    } = req.body;

    if (
      !companyId ||
      !name ||
      !startTime ||
      !endTime
    ) {
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

      ...(breakStart !== undefined && {
        breakStart: timeToDate(breakStart),
      }),

      ...(breakEnd !== undefined && {
        breakEnd: timeToDate(breakEnd),
      }),
    });

    return res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: serializeBigInt(shift),
    });
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message:
            "Shift name already exists for this company",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid company reference",
        });
      }
    }

    console.error("Create shift error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/shifts/:id
|--------------------------------------------------------------------------
*/

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id = parseId(req.params.id);

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
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
    } = req.body;

    const shiftData = {
      ...(name !== undefined && {
        name,
      }),

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
    };

    if (Object.keys(shiftData).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No fields provided for update",
      });
    }

    const shift = await updateShift(
      id,
      shiftData
    );

    return res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      data: serializeBigInt(shift),
    });
  } catch (error) {
    if (handleInvalidShiftId(error, res)) {
      return;
    }

    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message:
            "Shift name already exists for this company",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid company reference",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Shift not found",
        });
      }
    }

    console.error("Update shift error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}