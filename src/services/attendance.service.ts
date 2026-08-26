import prisma from "../config/prisma.js";

export async function getAllAttendances() {
  return prisma.attendance.findMany({
    include: {
      schedule: {
        include: {
          employee: true,
          shift: true,
          office: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAttendanceById(id: bigint) {
  return prisma.attendance.findUnique({
    where: { id },
    include: {
      schedule: {
        include: {
          employee: true,
          shift: true,
          office: true,
        },
      },
    },
  });
}

export async function clockInAttendance(data: {
  scheduleId: bigint;
  checkInAt: Date;
  status: string;
}) {
  return prisma.attendance.create({
    data: {
      scheduleId: data.scheduleId,
      checkInAt: data.checkInAt,
      status: data.status,
    },
  });
}

export async function clockOutAttendance(
  id: bigint,
  checkOutAt: Date
) {
  return prisma.attendance.update({
    where: { id },
    data: {
      checkOutAt,
    },
  });
}

export async function getAttendanceBySchedule(
  scheduleId: bigint
) {
  return prisma.attendance.findUnique({
    where: {
      scheduleId,
    },
  });
}

export async function getScheduleForAttendance(
  scheduleId: bigint
) {
  return prisma.schedule.findUnique({
    where: {
      id: scheduleId,
    },
    include: {
      shift: true,
      employee: true,
      office: true,
      attendance: true,
    },
  });
}