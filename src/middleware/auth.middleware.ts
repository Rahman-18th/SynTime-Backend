import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import prisma
  from "../config/prisma.js";

import {
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "../config/env.js";

export interface AuthRequest
  extends Request {
  user?: {
    userId: string;

    employeeId:
      | string
      | null;

    roles: string[];
  };
}

interface JwtPayload {
  userId: string;

  employeeId:
    | string
    | null;

  roles: string[];
}

/*
|--------------------------------------------------------------------------
| JWT payload validation
|--------------------------------------------------------------------------
*/

function isJwtPayload(
  value: unknown
): value is JwtPayload {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const payload =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof payload.userId ===
      "string" &&
    (
      payload.employeeId ===
        null ||
      typeof payload.employeeId ===
        "string"
    ) &&
    Array.isArray(
      payload.roles
    ) &&
    payload.roles.every(
      (role) =>
        typeof role ===
        "string"
    )
  );
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader =
    req.headers.authorization;

  if (!authorizationHeader) {
    return res
      .status(401)
      .json({
        success: false,

        message:
          "Authorization token is required",
      });
  }

  const [
    scheme,
    token,
  ] =
    authorizationHeader
      .trim()
      .split(/\s+/);

  if (
    scheme !== "Bearer" ||
    !token
  ) {
    return res
      .status(401)
      .json({
        success: false,

        message:
          "Invalid authorization format",
      });
  }

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error(
      "JWT_SECRET is not configured"
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Internal server error",
      });
  }

  try {
    const decoded =
      jwt.verify(
        token,
        jwtSecret,
        {
          issuer:
            JWT_ISSUER,

          audience:
            JWT_AUDIENCE,
        }
      );

    if (
      !isJwtPayload(
        decoded
      )
    ) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid or expired token",
        });
    }

    let userId: bigint;

    try {
      userId =
        BigInt(
          decoded.userId
        );
    } catch {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid or expired token",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Database-backed session validation
    |--------------------------------------------------------------------------
    |
    | JWT membuktikan identitas.
    | Database menentukan apakah account masih boleh digunakan.
    |
    */

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          id: true,
          employeeId: true,
          isActive: true,

          employee: {
            select: {
              status: true,
            },
          },

          roles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid or expired token",
        });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "User account is inactive",
        });
    }

    if (
      user.employee &&
      user.employee.status !==
        "active"
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Employee account is inactive",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Fresh authorization information
    |--------------------------------------------------------------------------
    |
    | Jangan percaya roles lama dari JWT.
    |
    */

    req.user = {
      userId:
        user.id.toString(),

      employeeId:
        user.employeeId
          ?.toString() ??
        null,

      roles:
        user.roles.map(
          (userRole) =>
            userRole.role.name
        ),
    };

    next();
  } catch (error) {
    if (
      error instanceof
      jwt.JsonWebTokenError ||
      error instanceof
      jwt.TokenExpiredError ||
      error instanceof
      jwt.NotBeforeError
    ) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid or expired token",
        });
    }

    console.error(
      "Authentication middleware error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Internal server error",
      });
  }
}