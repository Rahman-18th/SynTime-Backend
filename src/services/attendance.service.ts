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

  checkInLatitude: number;
  checkInLongitude: number;
  checkInDistanceMeters: number;
}) {
  return prisma.attendance.create({
    data: {
      scheduleId: data.scheduleId,
      checkInAt: data.checkInAt,
      status: data.status,

      checkInLatitude: data.checkInLatitude,
      checkInLongitude: data.checkInLongitude,
      checkInDistanceMeters:
        data.checkInDistanceMeters,
    },
  });
}

export async function clockOutAttendance(
  id: bigint,
  data: {
    checkOutAt: Date;
    checkOutLatitude: number;
    checkOutLongitude: number;
    checkOutDistanceMeters: number;
  }
) {
  return prisma.attendance.update({
    where: { id },
    data: {
      checkOutAt: data.checkOutAt,

      checkOutLatitude:
        data.checkOutLatitude,

      checkOutLongitude:
        data.checkOutLongitude,

      checkOutDistanceMeters:
        data.checkOutDistanceMeters,
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