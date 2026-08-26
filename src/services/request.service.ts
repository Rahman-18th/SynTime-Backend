import prisma from "../config/prisma.js";

export async function getAllRequests() {
  return prisma.request.findMany({
    include: {
      employee: true,
      reviewer: true,
      attachments: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
}

export async function getRequestById(id: bigint) {
  return prisma.request.findUnique({
    where: { id },
    include: {
      employee: true,
      reviewer: true,
      attachments: true,
    },
  });
}

export async function getRequestsByEmployee(
  employeeId: bigint
) {
  return prisma.request.findMany({
    where: {
      employeeId,
    },
    include: {
      reviewer: true,
      attachments: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
}

export async function createRequest(data: {
  employeeId: bigint;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  return prisma.request.create({
    data: {
      employeeId: data.employeeId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "pending",
    },
  });
}

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
    where: { id },
    data: {
      reviewedBy: data.reviewedBy,
      status: data.status,
      reviewedAt: data.reviewedAt,

      ...(data.reviewNote !== undefined && {
        reviewNote: data.reviewNote,
      }),
    },
  });
}