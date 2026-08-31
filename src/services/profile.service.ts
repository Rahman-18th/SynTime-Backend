import prisma from "../config/prisma.js";

export async function getEmployeeProfile(
  employeeId: bigint
) {
  return prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    include: {
      company: true,
      department: true,
      office: true,
      user: true,
    },
  });
}

export async function updateEmployeeProfile(
  employeeId: bigint,
  data: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  }
) {
  return prisma.$transaction(
    async (tx) => {
      const updateData: Parameters<
        typeof tx.employee.update
      >[0]["data"] = {
        firstName: data.firstName,
        email: data.email,
      };

      if (data.lastName !== undefined) {
        updateData.lastName =
            data.lastName;
      }

      if (data.phone !== undefined) {
        updateData.phone =
            data.phone;
      }

      await tx.employee.update({
        where: {
          id: employeeId,
        },
        data: updateData,
      });

      await tx.user.updateMany({
        where: {
          employeeId,
        },
        data: {
          email: data.email,
        },
      });

      return tx.employee.findUnique({
        where: {
          id: employeeId,
        },
        include: {
          company: true,
          department: true,
          office: true,
          user: true,
        },
      });
    }
  );
}