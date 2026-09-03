import prisma from "../config/prisma.js";

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

export async function getAllRequests() {
  return prisma.request.findMany({
    include: requestInclude,

    orderBy: {
      submittedAt: "desc",
    },
  });
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