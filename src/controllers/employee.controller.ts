import type { Request, Response } from "express";

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employee.service.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

import {
  successResponse,
  errorResponse,
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
    errorResponse(
      res,
      400,
      "Invalid employee ID"
    );

    return true;
  }

  return false;
}

function parsePositiveInteger(
  value: unknown,
  fieldName: string
): number | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `INVALID_${fieldName.toUpperCase()}`
    );
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `INVALID_${fieldName.toUpperCase()}`
    );
  }

  return parsed;
}

function parseDepartmentId(
  value: unknown
): bigint | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "INVALID_DEPARTMENT_ID"
    );
  }

  try {
    return BigInt(value);
  } catch {
    throw new Error(
      "INVALID_DEPARTMENT_ID"
    );
  }
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
    const page =
      parsePositiveInteger(
        req.query.page,
        "page"
      );

    const limit =
      parsePositiveInteger(
        req.query.limit,
        "limit"
      );

    if (
      limit !== undefined &&
      limit > 100
    ) {
      return errorResponse(
        res,
        400,
        "Limit cannot exceed 100"
      );
    }

    const search =
      typeof req.query.search ===
      "string"
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status ===
      "string"
        ? req.query.status
        : undefined;

    if (
      status &&
      ![
        "active",
        "inactive",
      ].includes(status)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid employee status. Use active or inactive."
      );
    }

    const departmentId =
      parseDepartmentId(
        req.query.departmentId
      );

    const result =
      await getAllEmployees({
        ...(page !== undefined && {
          page,
        }),
        ...(limit !== undefined && {
          limit,
        }),
        ...(search && {
          search,
        }),
        ...(status && {
          status,
        }),
        ...(departmentId !==
          undefined && {
          departmentId,
        }),
      });

    const totalPages =
      result.paginationEnabled
        ? Math.ceil(
            result.total /
              result.limit
          )
        : result.total > 0
          ? 1
          : 0;

    const meta = {
      page:
        result.paginationEnabled
          ? result.page
          : 1,
      limit:
        result.paginationEnabled
          ? result.limit
          : result.total,
      total:
        result.total,
      totalPages,
      hasNextPage:
        result.paginationEnabled &&
        result.page < totalPages,
      hasPreviousPage:
        result.paginationEnabled &&
        result.page > 1,
    };

    return successResponse(
      res,
      200,
      "Employees retrieved successfully",
      result.employees,
      meta
    );
  } catch (error) {
    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "INVALID_PAGE"
      ) {
        return errorResponse(
          res,
          400,
          "Page must be a positive integer"
        );
      }

      if (
        error.message ===
        "INVALID_LIMIT"
      ) {
        return errorResponse(
          res,
          400,
          "Limit must be a positive integer"
        );
      }

      if (
        error.message ===
        "INVALID_DEPARTMENT_ID"
      ) {
        return errorResponse(
          res,
          400,
          "Invalid department ID"
        );
      }
    }

    console.error(
      "Get employees error:",
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
| GET /api/employees/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseEmployeeId(req.params.id);

    const employee =
      await getEmployeeById(id);

    if (!employee) {
      return errorResponse(
        res,
        404,
        "Employee not found"
      );
    }

    return successResponse(
      res,
      200,
      "Employee retrieved successfully",
      serializeBigInt(employee)
    );
  } catch (error) {
    if (
      handleInvalidEmployeeId(
        error,
        res
      )
    ) {
      return;
    }

    console.error(
      "Get employee error:",
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
| POST /api/employees
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
      return errorResponse(res, 400, "Request body is required");
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
      return errorResponse(res, 400, "Required employee fields are missing");
    }

    const employeeData = {
      companyId:
        BigInt(companyId),

      departmentId:
        BigInt(departmentId),

      officeId:
        BigInt(officeId),

      employeeNumber,
      firstName,
      email,

      ...(lastName !== undefined && {
        lastName,
      }),

      ...(phone !== undefined && {
        phone,
      }),

      ...(position !== undefined && {
        position,
      }),

      ...(workType !== undefined && {
        workType,
      }),

      ...(joinDate !== undefined && {
        joinDate: new Date(joinDate),
      }),
    };

    const employee =
      await createEmployee(
        employeeData
      );

   return successResponse(
  res,
  201,
  "Employee created successfully",
  serializeBigInt(employee)
);
  } catch (error) {
    if (isPrismaKnownError(error)) {
  if (error.code === "P2002") {
    return errorResponse(
      res,
      409,
      "Employee number or email already exists"
    );
  }

  if (error.code === "P2003") {
    return errorResponse(
      res,
      400,
      "Invalid company, department, or office reference"
    );
  }
}

console.error(
  "Create employee error:",
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
| PUT /api/employees/:id
|--------------------------------------------------------------------------
*/

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseEmployeeId(req.params.id);

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
        departmentId:
          BigInt(departmentId),
      }),

      ...(officeId !== undefined && {
        officeId:
          BigInt(officeId),
      }),

      ...(firstName !== undefined && {
        firstName,
      }),

      ...(lastName !== undefined && {
        lastName,
      }),

      ...(email !== undefined && {
        email,
      }),

      ...(phone !== undefined && {
        phone,
      }),

      ...(position !== undefined && {
        position,
      }),

      ...(workType !== undefined && {
        workType,
      }),

      ...(joinDate !== undefined && {
        joinDate: new Date(joinDate),
      }),
    };

    if (
      Object.keys(employeeData).length === 0
    ) {
     return errorResponse(
  res,
  400,
  "No fields provided for update"
);
    }

    const employee =
      await updateEmployee(
        id,
        employeeData
      );

    return successResponse(
  res,
  200,
  "Employee updated successfully",
  serializeBigInt(employee)
);
  } catch (error) {
    if (
      handleInvalidEmployeeId(
        error,
        res
      )
    ) {
      return;
    }

    if (isPrismaKnownError(error)) {
  if (error.code === "P2002") {
    return errorResponse(
      res,
      409,
      "Employee number or email already exists"
    );
  }

  if (error.code === "P2003") {
    return errorResponse(
      res,
      400,
      "Invalid department or office reference"
    );
  }

  if (error.code === "P2025") {
    return errorResponse(
      res,
      404,
      "Employee not found"
    );
  }

  console.error(
  "Update employee error:",
  error
);

return errorResponse(
  res,
  500,
  "Internal server error"
);
}
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
    const id =
      parseEmployeeId(req.params.id);

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const { status } = req.body;

    if (!status) {
  return errorResponse(
    res,
    400,
    "Status is required"
  );
}

    const allowedStatuses = [
      "active",
      "inactive",
    ];

    if (!allowedStatuses.includes(status)) {
  return errorResponse(
    res,
    400,
    "Invalid employee status. Use active or inactive."
  );
}

    const employee =
      await updateEmployeeStatus(
        id,
        status
      );

    return successResponse(
  res,
  200,
  "Employee status updated successfully",
  serializeBigInt(employee)
);
  } catch (error) {
    if (isPrismaKnownError(error)) {
  if (error.code === "P2025") {
    return errorResponse(
      res,
      404,
      "Employee not found"
    );
  }
}

console.error(
  "Update employee status error:",
  error
);

return errorResponse(
  res,
  500,
  "Internal server error"
);
  }
}