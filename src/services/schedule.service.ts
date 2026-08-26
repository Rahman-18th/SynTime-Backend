import prisma from "../config/prisma.js";

export async function getAllSchedules() {
  return prisma.schedule.findMany({
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
    orderBy: {
      workDate: "asc",
    },
  });
}

export async function getScheduleById(id: bigint) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
  });
}

export async function createSchedule(data: {
  employeeId: bigint;
  shiftId: bigint;
  officeId: bigint;
  workDate: Date;
  status?: string;
}) {
  return prisma.schedule.create({
    data: {
      employeeId: data.employeeId,
      shiftId: data.shiftId,
      officeId: data.officeId,
      workDate: data.workDate,

      ...(data.status !== undefined && {
        status: data.status,
      }),
    },
  });
}

export async function updateSchedule(
  id: bigint,
  data: {
    employeeId?: bigint;
    shiftId?: bigint;
    officeId?: bigint;
    workDate?: Date;
    status?: string;
  }
) {
  return prisma.schedule.update({
    where: { id },
    data: {
      ...(data.employeeId !== undefined && {
        employeeId: data.employeeId,
      }),

      ...(data.shiftId !== undefined && {
        shiftId: data.shiftId,
      }),

      ...(data.officeId !== undefined && {
        officeId: data.officeId,
      }),

      ...(data.workDate !== undefined && {
        workDate: data.workDate,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),
    },
  });
}