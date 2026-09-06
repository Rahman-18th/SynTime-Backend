import prisma from "../config/prisma.js";
import type {
  Prisma,
} from "../generated/prisma/client.js";

interface AttendanceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date?: Date;
}

export async function getAllAttendances(
  options: AttendanceQueryOptions = {}
) {
  const scheduleFilter:
    Prisma.ScheduleWhereInput = {};

  if (options.search) {
    const search = options.search.trim();

    if (search) {
      scheduleFilter.employee = {
        is: {
          OR: [
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
          ],
        },
      };
    }
  }

  if (options.date) {
    const startDate = options.date;
    const endDate = new Date(
      startDate.getTime() + 24 * 60 * 60 * 1000
    );

    scheduleFilter.workDate = {
      gte: startDate,
      lt: endDate,
    };
  }

  const baseWhere:
    Prisma.AttendanceWhereInput =
      Object.keys(scheduleFilter).length > 0
        ? {
            schedule: {
              is: scheduleFilter,
            },
          }
        : {};

  const where: Prisma.AttendanceWhereInput = {
    ...baseWhere,
    ...(options.status && {
      status: options.status,
    }),
  };

  const paginationEnabled =
    options.page !== undefined ||
    options.limit !== undefined;
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;

  const [
    attendances,
    total,
    totalRecords,
    present,
    late,
    incomplete,
  ] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      include: {
        schedule: {
          include: {
            employee: true,
            shift: true,
            office: true,
          },
        },
      },
      orderBy: [
        {
          schedule: {
            workDate: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      ...(paginationEnabled && {
        skip: (page - 1) * limit,
        take: limit,
      }),
    }),
    prisma.attendance.count({
      where,
    }),
    prisma.attendance.count({
      where: baseWhere,
    }),
    prisma.attendance.count({
      where: {
        ...baseWhere,
        status: "present",
      },
    }),
    prisma.attendance.count({
      where: {
        ...baseWhere,
        status: "late",
      },
    }),
    prisma.attendance.count({
      where: {
        ...baseWhere,
        checkOutAt: null,
      },
    }),
  ]);

  return {
    attendances,
    total,
    paginationEnabled,
    page,
    limit,
    summary: {
      totalRecords,
      present,
      late,
      incomplete,
    },
  };
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

export async function getTodayScheduleByEmployee(
  employeeId: bigint,
  workDate: Date
) {
  return prisma.schedule.findUnique({
    where: {
      employeeId_workDate: {
        employeeId,
        workDate,
      },
    },
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
  });
}

export async function getMyAttendances(
  employeeId: bigint,
  month?: number,
  year?: number
) {
  let dateFilter;

  if (month && year) {
    const startDate = new Date(
      Date.UTC(year, month - 1, 1)
    );

    const endDate = new Date(
      Date.UTC(year, month, 1)
    );

    dateFilter = {
      gte: startDate,
      lt: endDate,
    };
  }

  return prisma.attendance.findMany({
    where: {
      schedule: {
        employeeId,
        ...(dateFilter && {
          workDate: dateFilter,
        }),
      },
    },
    include: {
      schedule: {
        include: {
          office: true,
          shift: true,
        },
      },
    },
    orderBy: {
      schedule: {
        workDate: "desc",
      },
    },
  });
}