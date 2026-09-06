import type {
  Request,
  Response,
} from "express";

import {
  loginUser,
} from "../services/auth.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

export async function login(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
    } =
      req.body ?? {};

    if (
      typeof email !==
        "string" ||
      typeof password !==
        "string"
    ) {
      return errorResponse(
        res,
        400,
        "Email and password are required"
      );
    }

    const normalizedEmail =
      email.trim();

    if (
      !normalizedEmail ||
      !password
    ) {
      return errorResponse(
        res,
        400,
        "Email and password are required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Basic size protection
    |--------------------------------------------------------------------------
    */

    if (
      normalizedEmail.length >
      254
    ) {
      return errorResponse(
        res,
        400,
        "Invalid email"
      );
    }

    if (
      password.length > 128
    ) {
      return errorResponse(
        res,
        400,
        "Invalid password"
      );
    }

    const result =
      await loginUser(
        normalizedEmail,
        password
      );

    return successResponse(
      res,
      200,
      "Login successful",
      result
    );
  } catch (error) {
    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "INVALID_CREDENTIALS"
      ) {
        return errorResponse(
          res,
          401,
          "Invalid email or password"
        );
      }

      if (
        error.message ===
        "ACCOUNT_INACTIVE"
      ) {
        return errorResponse(
          res,
          403,
          "Account is inactive"
        );
      }

      if (
        error.message ===
        "EMPLOYEE_INACTIVE"
      ) {
        return errorResponse(
          res,
          403,
          "Employee account is inactive"
        );
      }

      if (
        error.message ===
        "JWT_SECRET_NOT_CONFIGURED"
      ) {
        console.error(
          "JWT_SECRET is not configured"
        );

        return errorResponse(
          res,
          500,
          "Internal server error"
        );
      }
    }

    console.error(
      "Login error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}