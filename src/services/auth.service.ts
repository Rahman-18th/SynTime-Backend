import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";

import {
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "../config/env.js";

export async function loginUser(
  email: string,
  password: string
) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail,
      },

      include: {
        roles: {
          include: {
            role: true,
          },
        },

        employee: true,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Generic credential failure
  |--------------------------------------------------------------------------
  |
  | Jangan kasih tahu attacker apakah email ada atau tidak.
  |
  */

  if (!user) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const passwordValid =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!passwordValid) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Account status
  |--------------------------------------------------------------------------
  */

  if (!user.isActive) {
    throw new Error(
      "ACCOUNT_INACTIVE"
    );
  }

  if (
    user.employee &&
    user.employee.status !==
      "active"
  ) {
    throw new Error(
      "EMPLOYEE_INACTIVE"
    );
  }

  const roleNames =
    user.roles.map(
      (userRole) =>
        userRole.role.name
    );

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET_NOT_CONFIGURED"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | JWT
  |--------------------------------------------------------------------------
  */

  const token =
    jwt.sign(
      {
        userId:
          user.id.toString(),

        employeeId:
          user.employeeId
            ?.toString() ??
          null,

        roles:
          roleNames,
      },

      jwtSecret,

      {
        expiresIn: "1d",

        issuer:
          JWT_ISSUER,

        audience:
          JWT_AUDIENCE,
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Login timestamp
  |--------------------------------------------------------------------------
  */

  await prisma.user.update({
    where: {
      id:
        user.id,
    },

    data: {
      lastLoginAt:
        new Date(),
    },
  });

  return {
    token,

    user: {
      id:
        user.id.toString(),

      employeeId:
        user.employeeId
          ?.toString() ??
        null,

      email:
        user.email,

      roles:
        roleNames,

      employee:
        user.employee
          ? {
              id:
                user.employee.id.toString(),

              employeeNumber:
                user.employee.employeeNumber,

              firstName:
                user.employee.firstName,

              lastName:
                user.employee.lastName,
            }
          : null,
    },
  };
}