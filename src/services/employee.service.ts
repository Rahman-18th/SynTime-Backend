import prisma from "../config/prisma.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";


/*
|--------------------------------------------------------------------------
| Employee Queries
|--------------------------------------------------------------------------
*/

interface EmployeeQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: bigint;
}

export async function getAllEmployees(
  options: EmployeeQueryOptions = {}
) {
  const where:
    Prisma.EmployeeWhereInput = {};

  if (options.search) {
    const search =
      options.search.trim();

    if (search) {
      where.OR = [
        {
          employeeNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          position: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          department: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }
  }

  if (options.status) {
    where.status =
      options.status;
  }

  if (
    options.departmentId !==
    undefined
  ) {
    where.departmentId =
      options.departmentId;
  }

  const paginationEnabled =
    options.page !== undefined ||
    options.limit !== undefined;

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 10;

  const [
    employees,
    total,
  ] =
    await prisma.$transaction([
      prisma.employee.findMany({
        where,

        include: {
          company: true,

          department: true,

          office: true,

          user: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        ...(paginationEnabled && {
          skip:
            (page - 1) *
            limit,

          take: limit,
        }),
      }),

      prisma.employee.count({
        where,
      }),
    ]);

  return {
    employees,
    total,
    paginationEnabled,
    page,
    limit,
  };
}

export async function getEmployeeById(
  id: bigint
) {
  return prisma.employee.findUnique({
    where: {
      id,
    },

    include: {
      company: true,

      department: true,

      office: true,

      user: {
        select: {
          id: true,
          employeeId: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,

          roles: {
            include: {
              role: true,
            },
          },
        },
      },

      schedules: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
*/

export async function createEmployee(
  data: {
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;

    employeeNumber: string;

    firstName: string;
    lastName?: string;

    email: string;
    phone?: string;

    position?: string;
    workType?: string;

    joinDate?: Date;
  }
) {
  return prisma.employee.create({
    data: {
      companyId:
        data.companyId,

      departmentId:
        data.departmentId,

      officeId:
        data.officeId,

      employeeNumber:
        data.employeeNumber,

      firstName:
        data.firstName,

      email:
        data.email,

      ...(data.lastName !==
        undefined && {
        lastName:
          data.lastName,
      }),

      ...(data.phone !==
        undefined && {
        phone:
          data.phone,
      }),

      ...(data.position !==
        undefined && {
        position:
          data.position,
      }),

      ...(data.workType !==
        undefined && {
        workType:
          data.workType,
      }),

      ...(data.joinDate !==
        undefined && {
        joinDate:
          data.joinDate,
      }),
    },
  });
}

/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
*/

export async function updateEmployee(
  id: bigint,
  data: {
    departmentId?: bigint;
    officeId?: bigint;

    firstName?: string;
    lastName?: string;

    email?: string;
    phone?: string;

    position?: string;
    workType?: string;

    joinDate?: Date;
  }
) {
  return prisma.employee.update({
    where: {
      id,
    },

    data: {
      ...(data.departmentId !==
        undefined && {
        departmentId:
          data.departmentId,
      }),

      ...(data.officeId !==
        undefined && {
        officeId:
          data.officeId,
      }),

      ...(data.firstName !==
        undefined && {
        firstName:
          data.firstName,
      }),

      ...(data.lastName !==
        undefined && {
        lastName:
          data.lastName,
      }),

      ...(data.email !==
        undefined && {
        email:
          data.email,
      }),

      ...(data.phone !==
        undefined && {
        phone:
          data.phone,
      }),

      ...(data.position !==
        undefined && {
        position:
          data.position,
      }),

      ...(data.workType !==
        undefined && {
        workType:
          data.workType,
      }),

      ...(data.joinDate !==
        undefined && {
        joinDate:
          data.joinDate,
      }),
    },
  });
}

/*
|--------------------------------------------------------------------------
| Update Employee Status
|--------------------------------------------------------------------------
*/

export async function updateEmployeeStatus(
  id: bigint,
  status: string
) {
  return prisma.employee.update({
    where: {
      id,
    },

    data: {
      status,
    },
  });
}