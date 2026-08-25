import type { Request, Response } from "express";

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employee.service.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function serializeBigInt(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function parseEmployeeId(
  id: string | string[] | undefined
): bigint {
  if (!id || Array.isArray(id)) {
    throw new Error("INVALID_EMPLOYEE_ID");
  }

  try {
    return BigInt(id);
  } catch {
    throw new Error("INVALID_EMPLOYEE_ID");
  }
}

function handleInvalidEmployeeId(
  error: unknown,
  res: Response
) {
  if (
    error instanceof Error &&
    error.message === "INVALID_EMPLOYEE_ID"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });

    return true;
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| GET /api/employees
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const employees = await getAllEmployees();

    return res.status(200).json({
      success: true,
      data: serializeBigInt(employees),
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/employees/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id = parseEmployeeId(req.params.id);

    const employee = await getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInt(employee),
    });
  } catch (error) {
    if (handleInvalidEmployeeId(error, res)) {
      return;
    }

    console.error("Get employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/employees
|--------------------------------------------------------------------------
*/

export async function store(
  req: Request,
  res: Response
) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      companyId,
      departmentId,
      officeId,
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      position,
      workType,
      joinDate,
    } = req.body;

    if (
      !companyId ||
      !departmentId ||
      !officeId ||
      !employeeNumber ||
      !firstName ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Required employee fields are missing",
      });
    }

    const employeeData = {
      companyId: BigInt(companyId),
      departmentId: BigInt(departmentId),
      officeId: BigInt(officeId),
      employeeNumber,
      firstName,
      email,

      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(position !== undefined && { position }),
      ...(workType !== undefined && { workType }),

      ...(joinDate !== undefined && {
        joinDate: new Date(joinDate),
      }),
    };

    const employee = await createEmployee(employeeData);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: serializeBigInt(employee),
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/employees/:id
|--------------------------------------------------------------------------
*/

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id = parseEmployeeId(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      departmentId,
      officeId,
      firstName,
      lastName,
      email,
      phone,
      position,
      workType,
      joinDate,
    } = req.body;

    const employeeData = {
      ...(departmentId !== undefined && {
        departmentId: BigInt(departmentId),
      }),

      ...(officeId !== undefined && {
        officeId: BigInt(officeId),
      }),

      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(position !== undefined && { position }),
      ...(workType !== undefined && { workType }),

      ...(joinDate !== undefined && {
        joinDate: new Date(joinDate),
      }),
    };

    if (Object.keys(employeeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const employee = await updateEmployee(
      id,
      employeeData
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: serializeBigInt(employee),
    });
  } catch (error) {
    if (handleInvalidEmployeeId(error, res)) {
      return;
    }

    console.error("Update employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/employees/:id/status
|--------------------------------------------------------------------------
*/

export async function updateStatus(
  req: Request,
  res: Response
) {
  try {
    const id = parseEmployeeId(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "active",
      "inactive",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee status. Use active or inactive.",
      });
    }

    const employee = await updateEmployeeStatus(
      id,
      status
    );

    return res.status(200).json({
      success: true,
      message:
        "Employee status updated successfully",
      data: serializeBigInt(employee),
    });
  } catch (error) {
    if (handleInvalidEmployeeId(error, res)) {
      return;
    }

    console.error(
      "Update employee status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}