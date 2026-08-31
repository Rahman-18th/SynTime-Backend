import type { Response } from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  getEmployeeProfile,
updateEmployeeProfile,
} from "../services/profile.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";



export async function myProfile(
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

    const profile =
      await getEmployeeProfile(
        BigInt(employeeId)
      );

    if (!profile) {
      return errorResponse(
        res,
        404,
        "Employee profile not found"
      );
    }

    const fullName = [
      profile.firstName,
      profile.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return successResponse(
      res,
      200,
      "Profile retrieved successfully",
      {
        name: fullName,

        employeeId:
          profile.employeeNumber,

        company:
          profile.company.name,

        department:
          profile.department.name,

        position:
          profile.position ?? "",

        workType:
          profile.workType ?? "",

        email:
          profile.user?.email ??
          profile.email,

        phone:
          profile.phone ?? "",

        location:
          profile.office.address ??
          profile.office.name,
      }
    );
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function updateMyProfile(
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

    const {
      name,
      email,
      phone,
    } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Name is required"
      );
    }

    if (
      typeof email !== "string" ||
      email.trim().length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Email is required"
      );
    }

    const nameParts =
      name.trim().split(/\s+/);

    const firstName =
      nameParts.shift() ?? "";

    const lastName =
      nameParts.length > 0
        ? nameParts.join(" ")
        : null;

    const updated =
      await updateEmployeeProfile(
        BigInt(employeeId),
        {
          firstName,
          lastName,
          email: email.trim(),
          phone:
            typeof phone === "string" &&
            phone.trim().length > 0
              ? phone.trim()
              : null,
        }
      );

    if (!updated) {
      return errorResponse(
        res,
        404,
        "Employee profile not found"
      );
    }

    return successResponse(
      res,
      200,
      "Profile updated successfully",
      {
        name: [
          updated.firstName,
          updated.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        employeeId:
          updated.employeeNumber,

        company:
          updated.company.name,

        department:
          updated.department.name,

        position:
          updated.position ?? "",

        workType:
          updated.workType ?? "",

        email:
          updated.user?.email ??
          updated.email,

        phone:
          updated.phone ?? "",

        location:
          updated.office.address ??
          updated.office.name,
      }
    );
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}