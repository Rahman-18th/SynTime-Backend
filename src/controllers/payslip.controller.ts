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
  getPayslipsByEmployee,
} from "../services/payslip.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

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
    const payslips =
      await getAllPayslips();

    return res.status(200).json({
      success: true,
      data:
        serializeBigInt(payslips),
    });
  } catch (error) {
    console.error(
      "Get payslips error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
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
      return res.status(404).json({
        success: false,
        message:
          "Payslip not found",
      });
    }

    return res.status(200).json({
      success: true,
      data:
        serializeBigInt(payslip),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payslip ID",
      });
    }

    console.error(
      "Get payslip error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
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
      return res.status(403).json({
        success: false,
        message:
          "This user is not linked to an employee",
      });
    }

    const payslips =
      await getPayslipsByEmployee(
        BigInt(employeeId)
      );

    return res.status(200).json({
      success: true,
      data:
        serializeBigInt(payslips),
    });
  } catch (error) {
    console.error(
      "Get employee payslips error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
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
      return res.status(400).json({
        success: false,
        message:
          "Request body is required",
      });
    }

    const {
      employeeId,
      periodMonth,
      periodYear,
      basicSalary,
      totalIncome,
      totalDeduction,
      takeHomePay,
      status,
    } = req.body;

    if (
      !employeeId ||
      periodMonth === undefined ||
      periodYear === undefined ||
      basicSalary === undefined ||
      totalIncome === undefined ||
      totalDeduction === undefined ||
      takeHomePay === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required payslip fields are missing",
      });
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

    const parsedTakeHomePay =
      Number(takeHomePay);

    if (
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      Number.isNaN(parsedBasicSalary) ||
      Number.isNaN(parsedTotalIncome) ||
      Number.isNaN(parsedTotalDeduction) ||
      Number.isNaN(parsedTakeHomePay)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payslip numeric fields must contain valid numbers",
      });
    }

    if (
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        success: false,
        message:
          "periodMonth must be between 1 and 12",
      });
    }

    if (
      parsedBasicSalary < 0 ||
      parsedTotalIncome < 0 ||
      parsedTotalDeduction < 0 ||
      parsedTakeHomePay < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payslip amounts cannot be negative",
      });
    }

    const allowedStatuses = [
      "draft",
      "published",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payslip status",
      });
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

        takeHomePay:
          parsedTakeHomePay,

        ...(status !== undefined && {
          status,
        }),
      });

    return res.status(201).json({
      success: true,
      message:
        "Payslip created successfully",
      data:
        serializeBigInt(payslip),
    });
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message:
            "Payslip already exists for this employee and period",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid employee reference",
        });
      }
    }

    console.error(
      "Create payslip error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}