import prisma from "../config/prisma.js";

function getLocalToday() {
  const offsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  const now = new Date();

  const local = new Date(
    now.getTime() +
      offsetMinutes * 60 * 1000
  );

  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();

  return {
    now,

    today: new Date(
      Date.UTC(year, month, day)
    ),

    monthStart: new Date(
      Date.UTC(year, month, 1)
    ),

    nextMonthStart: new Date(
      Date.UTC(year, month + 1, 1)
    ),
  };
}

function formatTime(
  date: Date | null | undefined
) {
  if (!date) return null;

  const offsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  const local = new Date(
    date.getTime() +
      offsetMinutes * 60 * 1000
  );

  const hours = local
    .getUTCHours()
    .toString()
    .padStart(2, "0");

  const minutes = local
    .getUTCMinutes()
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}`;
}

function calculateTotalMinutes(
  checkInAt: Date | null,
  checkOutAt: Date | null,
  now: Date
) {
  if (!checkInAt) {
    return 0;
  }

  const end = checkOutAt ?? now;

  const difference =
    end.getTime() -
    checkInAt.getTime();

  return Math.max(
    0,
    Math.floor(
      difference / (1000 * 60)
    )
  );
}

export async function getEmployeeDashboard(
  employeeId: bigint
) {
  const {
    today,
    monthStart,
    nextMonthStart,
    now,
  } = getLocalToday();

  const [
    employee,
    todaySchedule,
    monthlyAttendances,
    notificationCount,
  ] = await Promise.all([
    prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        office: true,
      },
    }),

    prisma.schedule.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate: today,
        },
      },
      include: {
        shift: true,
        office: true,
        attendance: true,
      },
    }),

    prisma.attendance.findMany({
      where: {
        schedule: {
          employeeId,
          workDate: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
      },
      select: {
        status: true,
      },
    }),

    prisma.notification.count({
      where: {
        employeeId,
        isRead: false,
      },
    }),
  ]);

  if (!employee) {
    return null;
  }

  const attendance =
    todaySchedule?.attendance ?? null;

  const presentCount =
    monthlyAttendances.filter(
      (item) =>
        item.status === "present"
    ).length;

  const lateCount =
    monthlyAttendances.filter(
      (item) =>
        item.status === "late"
    ).length;

  const leaveCount =
    monthlyAttendances.filter(
      (item) =>
        item.status === "leave"
    ).length;

  const absentCount =
    monthlyAttendances.filter(
      (item) =>
        item.status === "absent"
    ).length;

  return {
    employee: {
      name: [
        employee.firstName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(" "),

      role:
        employee.position ?? "",

      workLocation:
        employee.office.address ??
        employee.office.name,
    },

    today: {
      date:
        today
          .toISOString()
          .split("T")[0],

      attendanceStatus:
        attendance?.status ??
        "not_checked_in",

      checkInTime:
        formatTime(
          attendance?.checkInAt
        ),

      checkOutTime:
        formatTime(
          attendance?.checkOutAt
        ),

      totalMinutes:
        calculateTotalMinutes(
          attendance?.checkInAt ??
            null,
          attendance?.checkOutAt ??
            null,
          now
        ),
    },

    schedule: todaySchedule
      ? {
          shiftName:
            todaySchedule.shift.name,

          startTime:
            formatTime(
              todaySchedule
                .shift
                .startTime
            ),

          endTime:
            formatTime(
              todaySchedule
                .shift
                .endTime
            ),

          location:
            todaySchedule
              .office.name,
        }
      : null,

    summary: {
      present: presentCount,
      late: lateCount,
      leave: leaveCount,
      absent: absentCount,
    },

    notificationCount,

    // Belum ada leave balance
    // di database.
    remainingLeave: null,
  };
}