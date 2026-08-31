import type { Response } from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  getEmployeeDashboard,
} from "../services/dashboard.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

export async function myDashboard(
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

    const dashboard =
      await getEmployeeDashboard(
        BigInt(employeeId)
      );

    if (!dashboard) {
      return errorResponse(
        res,
        404,
        "Employee not found"
      );
    }

    return successResponse(
      res,
      200,
      "Dashboard retrieved successfully",
      dashboard
    );
  } catch (error) {
    console.error(
      "Get dashboard error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}