import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
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

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const roleNames = user.roles.map((userRole) => userRole.role.name);

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }

  const token = jwt.sign(
    {
      userId: user.id.toString(),
      employeeId: user.employeeId?.toString() ?? null,
      roles: roleNames,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id.toString(),
      employeeId: user.employeeId?.toString() ?? null,
      email: user.email,
      roles: roleNames,

      employee: user.employee
        ? {
            id: user.employee.id.toString(),
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
          }
        : null,
    },
  };
}