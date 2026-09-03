import prisma from "../config/prisma.js";

export async function getAllDepartments() {
  return prisma.department.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
}

export async function getDepartmentById(
  id: bigint
) {
  return prisma.department.findUnique({
    where: {
      id,
    },

    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getDepartmentsByCompany(
  companyId: bigint
) {
  return prisma.department.findMany({
    where: {
      companyId,
    },

    orderBy: {
      name: "asc",
    },
  });
}

export async function createDepartment(data: {
  companyId: bigint;
  name: string;
  description?: string;
}) {
  return prisma.department.create({
    data: {
      companyId:
        data.companyId,

      name:
        data.name,

      ...(data.description !== undefined && {
        description:
          data.description,
      }),
    },
  });
}

export async function updateDepartment(
  id: bigint,
  data: {
    companyId?: bigint;
    name?: string;
    description?: string | null;
  }
) {
  return prisma.department.update({
    where: {
      id,
    },

    data,
  });
}