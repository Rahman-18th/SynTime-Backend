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

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";
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

function parseReferenceId(
  value: unknown
): bigint {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    throw new Error("INVALID_REFERENCE_ID");
  }

  try {
    const id = BigInt(value);

    if (id <= 0n) {
      throw new Error();
    }

    return id;
  } catch {
    throw new Error("INVALID_REFERENCE_ID");
  }
}

function parseWorkDate(
  value: unknown
): Date {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error("INVALID_WORK_DATE");
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number) as [number, number, number];

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("INVALID_WORK_DATE");
  }

  return date;
}

function handleInvalidScheduleId(
  error: unknown,
  res: Response
) {
  if (
    error instanceof Error &&
    error.message === "INVALID_ID"
  ) {
    errorResponse(
      res,
      400,
      "Invalid schedule ID"
    );

    return true;
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| GET /api/schedules
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const schedules =
      await getAllSchedules();

    return successResponse(
      res,
      200,
      "Schedules retrieved successfully",
      serializeBigInt(schedules)
    );
  } catch (error) {
    console.error(
      "Get schedules error:",
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
| GET /api/schedules/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id = parseId(req.params.id);

    const schedule =
      await getScheduleById(id);

    if (!schedule) {
      return errorResponse(
        res,
        404,
        "Schedule not found"
      );
    }

    return successResponse(
      res,
      200,
      "Schedule retrieved successfully",
      serializeBigInt(schedule)
    );
  } catch (error) {
    if (
      handleInvalidScheduleId(
        error,
        res
      )
    ) {
      return;
    }

    console.error(
      "Get schedule error:",
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
| POST /api/schedules
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
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
    }

    const {
      employeeId,
      shiftId,
      officeId,
      workDate,
      status,
    } = req.body;

    if (
      !employeeId ||
      !shiftId ||
      !officeId ||
      !workDate
    ) {
      return errorResponse(
        res,
        400,
        "employeeId, shiftId, officeId and workDate are required"
      );
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
      return errorResponse(
        res,
        400,
        "Invalid schedule status"
      );
    }

    const schedule =
      await createSchedule({
        employeeId:
          parseReferenceId(employeeId),

        shiftId:
          parseReferenceId(shiftId),

        officeId:
          parseReferenceId(officeId),

        workDate:
          parseWorkDate(workDate),

        ...(status !== undefined && {
          status,
        }),
      });

    return successResponse(
      res,
      201,
      "Schedule created successfully",
      serializeBigInt(schedule)
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_REFERENCE_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid employee, shift, or office ID"
      );
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_WORK_DATE"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid work date. Use YYYY-MM-DD"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SCHEDULE_REFERENCE"
    ) {
      return errorResponse(
        res,
        400,
        "Employee, shift, or office does not exist"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "SCHEDULE_COMPANY_MISMATCH"
    ) {
      return errorResponse(
        res,
        400,
        "Employee, shift, and office must belong to the same company"
      );
    }

    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Employee already has a schedule for this date"
        );
      }

      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid employee, shift, or office reference"
        );
      }
    }

    console.error(
      "Create schedule error:",
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
| PUT /api/schedules/:id
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
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
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
      return errorResponse(
        res,
        400,
        "Invalid schedule status"
      );
    }

    const scheduleData = {
      ...(employeeId !== undefined && {
        employeeId:
          parseReferenceId(employeeId),
      }),

      ...(shiftId !== undefined && {
        shiftId:
          parseReferenceId(shiftId),
      }),

      ...(officeId !== undefined && {
        officeId:
          parseReferenceId(officeId),
      }),

      ...(workDate !== undefined && {
        workDate:
          parseWorkDate(workDate),
      }),

      ...(status !== undefined && {
        status,
      }),
    };

    if (
      Object.keys(scheduleData).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "No fields provided for update"
      );
    }

    const schedule =
      await updateSchedule(
        id,
        scheduleData
      );

    return successResponse(
      res,
      200,
      "Schedule updated successfully",
      serializeBigInt(schedule)
    );
  } catch (error) {
    if (
      handleInvalidScheduleId(
        error,
        res
      )
    ) {
      return;
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_REFERENCE_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid employee, shift, or office ID"
      );
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_WORK_DATE"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid work date. Use YYYY-MM-DD"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SCHEDULE_REFERENCE"
    ) {
      return errorResponse(
        res,
        400,
        "Employee, shift, or office does not exist"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "SCHEDULE_COMPANY_MISMATCH"
    ) {
      return errorResponse(
        res,
        400,
        "Employee, shift, and office must belong to the same company"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "SCHEDULE_NOT_FOUND"
    ) {
      return errorResponse(
        res,
        404,
        "Schedule not found"
      );
    }

    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Employee already has a schedule for this date"
        );
      }

      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid employee, shift, or office reference"
        );
      }

      if (error.code === "P2025") {
        return errorResponse(
          res,
          404,
          "Schedule not found"
        );
      }
    }

    console.error(
      "Update schedule error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}