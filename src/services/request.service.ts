import prisma from "../config/prisma.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";

/*
|--------------------------------------------------------------------------
| Shared Includes
|--------------------------------------------------------------------------
*/

const requestInclude = {
  employee: true,

  reviewer: {
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

  attachments: true,
} as const;

/*
|--------------------------------------------------------------------------
| Get All Requests
|--------------------------------------------------------------------------
*/

interface RequestQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export async function getAllRequests(
  options: RequestQueryOptions = {}
) {
  const baseWhere: Prisma.RequestWhereInput = {};

  if (options.search) {
    const search = options.search.trim();

    if (search) {
      baseWhere.employee = {
        is: {
          OR: [
            { employeeNumber: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }
  }

  if (options.type) {
    baseWhere.type = options.type;
  }

  const where: Prisma.RequestWhereInput = {
    ...baseWhere,
    ...(options.status && { status: options.status }),
  };

  const paginationEnabled =
    options.page !== undefined || options.limit !== undefined;
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;

  const [
    requests,
    total,
    totalRequests,
    pending,
    approved,
    rejected,
  ] = await prisma.$transaction([
    prisma.request.findMany({
      where,
      include: requestInclude,
      orderBy: { submittedAt: "desc" },
      ...(paginationEnabled && {
        skip: (page - 1) * limit,
        take: limit,
      }),
    }),
    prisma.request.count({ where }),
    prisma.request.count({ where: baseWhere }),
    prisma.request.count({ where: { ...baseWhere, status: "pending" } }),
    prisma.request.count({ where: { ...baseWhere, status: "approved" } }),
    prisma.request.count({ where: { ...baseWhere, status: "rejected" } }),
  ]);

  return {
    requests,
    total,
    paginationEnabled,
    page,
    limit,
    summary: {
      totalRequests,
      pending,
      approved,
      rejected,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Get Request By ID
|--------------------------------------------------------------------------
*/

export async function getRequestById(
  id: bigint
) {
  return prisma.request.findUnique({
    where: {
      id,
    },

    include: requestInclude,
  });
}

/*
|--------------------------------------------------------------------------
| Get Employee Requests
|--------------------------------------------------------------------------
*/

export async function getRequestsByEmployee(
  employeeId: bigint
) {
  return prisma.request.findMany({
    where: {
      employeeId,
    },

    include: {
      reviewer: {
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

      attachments: true,
    },

    orderBy: {
      submittedAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Request
|--------------------------------------------------------------------------
*/

export async function createRequest(
  data: {
    employeeId: bigint;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }
) {
  return prisma.request.create({
    data: {
      employeeId:
        data.employeeId,

      type:
        data.type,

      startDate:
        data.startDate,

      endDate:
        data.endDate,

      reason:
        data.reason,

      status:
        "pending",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Review Request
|--------------------------------------------------------------------------
*/

export async function reviewRequest(
  id: bigint,
  data: {
    reviewedBy: bigint;
    status: string;
    reviewNote?: string;
    reviewedAt: Date;
  }
) {
  return prisma.request.update({
    where: {
      id,
    },

    data: {
      reviewedBy:
        data.reviewedBy,

      status:
        data.status,

      reviewedAt:
        data.reviewedAt,

      ...(data.reviewNote !==
        undefined && {
        reviewNote:
          data.reviewNote,
      }),
    },
  });
}