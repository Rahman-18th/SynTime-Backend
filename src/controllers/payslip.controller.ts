import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createPayslip,
  getAllPayslips,
  getPayslipById,
  getPublishedPayslipsByEmployee,
  updatePayslip,
} from "../services/payslip.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

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

function parsePositiveInteger(
  value: unknown,
  fieldName: string
): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`INVALID_${fieldName.toUpperCase()}`);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`INVALID_${fieldName.toUpperCase()}`);
  }

  return parsed;
}

/*
|--------------------------------------------------------------------------
| GET /api/payslips
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const page = parsePositiveInteger(req.query.page, "page");
    const limit = parsePositiveInteger(req.query.limit, "limit");

    if (limit !== undefined && limit > 100) {
      return errorResponse(res, 400, "Limit cannot exceed 100");
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    if (status && !["draft", "published"].includes(status)) {
      return errorResponse(res, 400, "Invalid payslip status");
    }

    const month = parsePositiveInteger(req.query.month, "month");

    if (month !== undefined && (month < 1 || month > 12)) {
      return errorResponse(res, 400, "Month must be between 1 and 12");
    }

    const year = parsePositiveInteger(req.query.year, "year");

    if (year !== undefined && (year < 2000 || year > 2100)) {
      return errorResponse(res, 400, "Year is invalid");
    }

    const result = await getAllPayslips({
      ...(page !== undefined && { page }),
      ...(limit !== undefined && { limit }),
      ...(search && { search }),
      ...(status && { status }),
      ...(month !== undefined && { month }),
      ...(year !== undefined && { year }),
    });

    const totalPages = result.paginationEnabled
      ? Math.ceil(result.total / result.limit)
      : result.total > 0
        ? 1
        : 0;

    return successResponse(
      res,
      200,
      "Payslips retrieved successfully",
      serializeBigInt(result.payslips),
      {
        page: result.paginationEnabled ? result.page : 1,
        limit: result.paginationEnabled ? result.limit : result.total,
        total: result.total,
        totalPages,
        hasNextPage:
          result.paginationEnabled && result.page < totalPages,
        hasPreviousPage:
          result.paginationEnabled && result.page > 1,
        summary: result.summary,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PAGE") {
        return errorResponse(
          res,
          400,
          "Page must be a positive integer"
        );
      }

      if (error.message === "INVALID_LIMIT") {
        return errorResponse(
          res,
          400,
          "Limit must be a positive integer"
        );
      }

      if (error.message === "INVALID_MONTH") {
        return errorResponse(
          res,
          400,
          "Month must be a positive integer"
        );
      }

      if (error.message === "INVALID_YEAR") {
        return errorResponse(
          res,
          400,
          "Year must be a positive integer"
        );
      }
    }

    console.error(
      "Get payslips error:",
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
| GET /api/payslips/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

    const payslip =
      await getPayslipById(id);

    if (!payslip) {
      return errorResponse(
        res,
        404,
        "Payslip not found"
      );
    }

    return successResponse(
      res,
      200,
      "Payslip retrieved successfully",
      serializeBigInt(payslip)
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid payslip ID"
      );
    }

    console.error(
      "Get payslip error:",
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
| GET /api/payslips/my
|--------------------------------------------------------------------------
*/

export async function myPayslips(
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

    const payslips =
      await getPublishedPayslipsByEmployee(
        BigInt(employeeId)
      );

    return successResponse(
      res,
      200,
      "Payslips retrieved successfully",
      serializeBigInt(payslips)
    );
  } catch (error) {
    console.error(
      "Get employee payslips error:",
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
| POST /api/payslips
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
      periodMonth,
      periodYear,
      basicSalary,
      totalIncome,
      totalDeduction,
      status,
    } = req.body;

    if (
      !employeeId ||
      periodMonth === undefined ||
      periodYear === undefined ||
      basicSalary === undefined ||
      totalIncome === undefined ||
      totalDeduction === undefined
    ) {
      return errorResponse(
        res,
        400,
        "Required payslip fields are missing"
      );
    }

    const month =
      Number(periodMonth);

    const year =
      Number(periodYear);

    const parsedBasicSalary =
      Number(basicSalary);

    const parsedTotalIncome =
      Number(totalIncome);

    const parsedTotalDeduction =
      Number(totalDeduction);

    if (
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      Number.isNaN(parsedBasicSalary) ||
      Number.isNaN(parsedTotalIncome) ||
      Number.isNaN(parsedTotalDeduction)
    ) {
      return errorResponse(
        res,
        400,
        "Payslip numeric fields must contain valid numbers"
      );
    }

    if (
      month < 1 ||
      month > 12
    ) {
      return errorResponse(
        res,
        400,
        "periodMonth must be between 1 and 12"
      );
    }

    if (
      year < 2000 ||
      year > 2100
    ) {
      return errorResponse(
        res,
        400,
        "periodYear is invalid"
      );
    }

    if (
      parsedBasicSalary < 0 ||
      parsedTotalIncome < 0 ||
      parsedTotalDeduction < 0
    ) {
      return errorResponse(
        res,
        400,
        "Payslip amounts cannot be negative"
      );
    }

    if (
      parsedTotalDeduction >
      parsedTotalIncome
    ) {
      return errorResponse(
        res,
        400,
        "Total deduction cannot exceed total income"
      );
    }

    const allowedStatuses = [
      "draft",
      "published",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid payslip status"
      );
    }

    const payslip =
      await createPayslip({
        employeeId:
          BigInt(employeeId),

        periodMonth:
          month,

        periodYear:
          year,

        basicSalary:
          parsedBasicSalary,

        totalIncome:
          parsedTotalIncome,

        totalDeduction:
          parsedTotalDeduction,

        ...(status !== undefined && {
          status,
        }),
      });

    return successResponse(
      res,
      201,
      "Payslip created successfully",
      serializeBigInt(payslip)
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Payslip already exists for this employee and period"
        );
      }

      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid employee reference"
        );
      }
    }

    console.error(
      "Create payslip error:",
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
| PUT /api/payslips/:id
|--------------------------------------------------------------------------
*/

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

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
      basicSalary,
      totalIncome,
      totalDeduction,
      status,
    } = req.body;

    const allowedStatuses = [
      "draft",
      "published",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid payslip status"
      );
    }

    const parsedData = {
      ...(basicSalary !== undefined && {
        basicSalary:
          Number(basicSalary),
      }),

      ...(totalIncome !== undefined && {
        totalIncome:
          Number(totalIncome),
      }),

      ...(totalDeduction !== undefined && {
        totalDeduction:
          Number(totalDeduction),
      }),

      ...(status !== undefined && {
        status,
      }),
    };

    if (
      Object.keys(parsedData).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "No fields provided for update"
      );
    }

    const numericValues = [
      parsedData.basicSalary,
      parsedData.totalIncome,
      parsedData.totalDeduction,
    ].filter(
      (value) =>
        value !== undefined
    );

    if (
      numericValues.some(
        (value) =>
          Number.isNaN(value) ||
          value! < 0
      )
    ) {
      return errorResponse(
        res,
        400,
        "Payslip amounts must be valid non-negative numbers"
      );
    }

    const existingPayslip =
      await getPayslipById(id);

    if (!existingPayslip) {
      return errorResponse(
        res,
        404,
        "Payslip not found"
      );
    }

    const finalTotalIncome =
      parsedData.totalIncome ??
      Number(existingPayslip.totalIncome);

    const finalTotalDeduction =
      parsedData.totalDeduction ??
      Number(existingPayslip.totalDeduction);

    if (
      finalTotalDeduction >
      finalTotalIncome
    ) {
      return errorResponse(
        res,
        400,
        "Total deduction cannot exceed total income"
      );
    }

    const payslip =
      await updatePayslip(
        id,
        parsedData
      );

    return successResponse(
      res,
      200,
      "Payslip updated successfully",
      serializeBigInt(payslip)
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid payslip ID"
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PAYSLIP_NOT_FOUND"
    ) {
      return errorResponse(
        res,
        404,
        "Payslip not found"
      );
    }

    console.error(
      "Update payslip error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}