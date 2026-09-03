import type {
  Request,
  Response,
} from "express";

import {
  createEmployeeAccount,
  resetEmployeePassword,
  updateEmployeeAccountStatus,
} from "../services/employee-account.service.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";

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
  req: Request,
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
  req: Request,
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
  req: Request,
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