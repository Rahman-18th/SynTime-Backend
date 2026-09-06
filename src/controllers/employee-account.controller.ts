import type {
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createEmployeeAccount,
  resetEmployeePassword,
  updateEmployeeAccountStatus,
} from "../services/employee-account.service.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";

import {
  writeAuditLog,
} from "../utils/audit.js";

import {
  getAuditContext,
} from "../utils/audit-context.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function parseEmployeeId(
  value:
    | string
    | string[]
    | undefined
): bigint {
  if (
    !value ||
    Array.isArray(value)
  ) {
    throw new Error(
      "INVALID_EMPLOYEE_ID"
    );
  }

  try {
    return BigInt(value);
  } catch {
    throw new Error(
      "INVALID_EMPLOYEE_ID"
    );
  }
}

function handleServiceError(
  error: unknown,
  res: Response
) {
  if (!(error instanceof Error)) {
    return false;
  }

  switch (error.message) {
    case "INVALID_EMPLOYEE_ID":
      errorResponse(
        res,
        400,
        "Invalid employee ID"
      );

      return true;

    case "EMPLOYEE_NOT_FOUND":
      errorResponse(
        res,
        404,
        "Employee not found"
      );

      return true;

    case "EMPLOYEE_ALREADY_HAS_ACCOUNT":
      errorResponse(
        res,
        409,
        "Employee already has a login account"
      );

      return true;

    case "EMAIL_ALREADY_HAS_ACCOUNT":
      errorResponse(
        res,
        409,
        "Employee email is already used by another user account"
      );

      return true;

    case "EMPLOYEE_ACCOUNT_NOT_FOUND":
      errorResponse(
        res,
        404,
        "Employee login account not found"
      );

      return true;

    case "EMPLOYEE_ROLE_NOT_FOUND":
      errorResponse(
        res,
        500,
        "Employee role is not configured"
      );

      return true;

    default:
      return false;
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/employees/:id/account
|--------------------------------------------------------------------------
*/

export async function createAccount(
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId =
      parseEmployeeId(
        req.params.id
      );

    const result =
      await createEmployeeAccount(
        employeeId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "employee.account_created",
      entityType: "employee",
      entityId: employeeId.toString(),
      description: "Created employee login account",
      metadata: {
        employeeId: employeeId.toString(),
        email: result.user.email,
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      201,
      "Employee login account created successfully",
      result
    );
  } catch (error) {
    if (
      handleServiceError(
        error,
        res
      )
    ) {
      return;
    }

    console.error(
      "Create employee account error:",
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
| POST /api/employees/:id/account/reset-password
|--------------------------------------------------------------------------
*/

export async function resetPassword(
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId =
      parseEmployeeId(
        req.params.id
      );

    const result =
      await resetEmployeePassword(
        employeeId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "employee.password_reset",
      entityType: "employee",
      entityId: employeeId.toString(),
      description: "Reset employee login password",
      metadata: {
        employeeId: employeeId.toString(),
        email: result.user.email,
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Employee temporary password reset successfully",
      result
    );
  } catch (error) {
    if (
      handleServiceError(
        error,
        res
      )
    ) {
      return;
    }

    console.error(
      "Reset employee password error:",
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
| PATCH /api/employees/:id/account/status
|--------------------------------------------------------------------------
*/

export async function updateAccountStatus(
  req: AuthRequest,
  res: Response
) {
  try {
    const employeeId =
      parseEmployeeId(
        req.params.id
      );

    const {
      isActive,
    } = req.body ?? {};

    if (
      typeof isActive !==
      "boolean"
    ) {
      return errorResponse(
        res,
        400,
        "isActive must be a boolean"
      );
    }

    const user =
      await updateEmployeeAccountStatus(
        employeeId,
        isActive
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "employee.account_status_changed",
      entityType: "employee",
      entityId: employeeId.toString(),
      description: isActive
        ? "Enabled employee login account"
        : "Disabled employee login account",
      metadata: { isActive },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Employee account status updated successfully",
      user
    );
  } catch (error) {
    if (
      handleServiceError(
        error,
        res
      )
    ) {
      return;
    }

    console.error(
      "Update employee account status error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}