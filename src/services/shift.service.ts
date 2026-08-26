import prisma from "../config/prisma.js";

export async function getAllShifts() {
  return prisma.shift.findMany({
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getShiftById(id: bigint) {
  return prisma.shift.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });
}

export async function createShift(data: {
  companyId: bigint;
  name: string;
  startTime: Date;
  endTime: Date;
  breakStart?: Date;
  breakEnd?: Date;
}) {
  return prisma.shift.create({
    data: {
      companyId: data.companyId,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,

      ...(data.breakStart !== undefined && {
        breakStart: data.breakStart,
      }),

      ...(data.breakEnd !== undefined && {
        breakEnd: data.breakEnd,
      }),
    },
  });
}

export async function updateShift(
  id: bigint,
  data: {
    name?: string;
    startTime?: Date;
    endTime?: Date;
    breakStart?: Date;
    breakEnd?: Date;
  }
) {
  return prisma.shift.update({
    where: { id },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.startTime !== undefined && {
        startTime: data.startTime,
      }),

      ...(data.endTime !== undefined && {
        endTime: data.endTime,
      }),

      ...(data.breakStart !== undefined && {
        breakStart: data.breakStart,
      }),

      ...(data.breakEnd !== undefined && {
        breakEnd: data.breakEnd,
      }),
    },
  });
}