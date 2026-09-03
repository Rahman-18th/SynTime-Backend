import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

function getLocalToday() {
  const offsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  const now = new Date();

  const local = new Date(
    now.getTime() +
      offsetMinutes * 60 * 1000
  );

  const year =
    local.getUTCFullYear();

  const month =
    local.getUTCMonth();

  const day =
    local.getUTCDate();

  return {
    now,

    today: new Date(
      Date.UTC(
        year,
        month,
        day
      )
    ),

    tomorrow: new Date(
      Date.UTC(
        year,
        month,
        day + 1
      )
    ),

    monthStart: new Date(
      Date.UTC(
        year,
        month,
        1
      )
    ),

    nextMonthStart: new Date(
      Date.UTC(
        year,
        month + 1,
        1
      )
    ),

    currentMonth:
      month + 1,

    currentYear:
      year,
  };
}

/*
|--------------------------------------------------------------------------
| Time Formatter
|--------------------------------------------------------------------------
*/

function formatTime(
  date: Date | null | undefined
) {
  if (!date) {
    return null;
  }

  const offsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  const local = new Date(
    date.getTime() +
      offsetMinutes * 60 * 1000
  );

  const hours =
    local
      .getUTCHours()
      .toString()
      .padStart(2, "0");

  const minutes =
    local
      .getUTCMinutes()
      .toString()
      .padStart(2, "0");

  return `${hours}:${minutes}`;
}

/*
|--------------------------------------------------------------------------
| Total Minutes
|--------------------------------------------------------------------------
*/

function calculateTotalMinutes(
  checkInAt: Date | null,
  checkOutAt: Date | null,
  now: Date
) {
  if (!checkInAt) {
    return 0;
  }

  const end =
    checkOutAt ?? now;

  const difference =
    end.getTime() -
    checkInAt.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60)
    )
  );
}

/*
|--------------------------------------------------------------------------
| Employee Dashboard
|--------------------------------------------------------------------------
*/

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
    todaySchedule?.attendance ??
    null;

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
      present:
        presentCount,

      late:
        lateCount,

      leave:
        leaveCount,

      absent:
        absentCount,
    },

    notificationCount,

    remainingLeave:
      null,
  };
}

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

export async function getAdminDashboard() {
  const {
    today,
    currentMonth,
    currentYear,
  } = getLocalToday();

  const [
    totalEmployees,
    activeEmployees,
    todayAttendances,
    pendingRequests,
    currentMonthPayslips,
    publishedAnnouncements,
    recentAttendances,
    recentRequests,
  ] = await Promise.all([
    /*
    |--------------------------------------------------------------------------
    | Employees
    |--------------------------------------------------------------------------
    */

    prisma.employee.count(),

    prisma.employee.count({
      where: {
        status: "active",
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Today's Attendance
    |--------------------------------------------------------------------------
    */

    prisma.attendance.findMany({
      where: {
        schedule: {
          workDate: today,
        },
      },

      select: {
        status: true,
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Pending Requests
    |--------------------------------------------------------------------------
    */

    prisma.request.count({
      where: {
        status: "pending",
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Current Month Payroll
    |--------------------------------------------------------------------------
    */

    prisma.payslip.findMany({
      where: {
        periodMonth:
          currentMonth,

        periodYear:
          currentYear,
      },

      select: {
        status: true,
        takeHomePay: true,
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Published Announcements
    |--------------------------------------------------------------------------
    */

    prisma.announcement.count({
      where: {
        isPublished: true,
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Recent Attendance
    |--------------------------------------------------------------------------
    */

    prisma.attendance.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        schedule: {
          include: {
            employee: {
              select: {
                id: true,
                employeeNumber: true,
                firstName: true,
                lastName: true,
              },
            },

            office: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    /*
    |--------------------------------------------------------------------------
    | Recent Requests
    |--------------------------------------------------------------------------
    */

    prisma.request.findMany({
      take: 5,

      orderBy: {
        submittedAt: "desc",
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const presentToday =
    todayAttendances.filter(
      (item) =>
        item.status === "present"
    ).length;

  const lateToday =
    todayAttendances.filter(
      (item) =>
        item.status === "late"
    ).length;

  const totalPayroll =
    currentMonthPayslips.reduce(
      (total, payslip) =>
        total +
        Number(
          payslip.takeHomePay
        ),
      0
    );

  const publishedPayslips =
    currentMonthPayslips.filter(
      (payslip) =>
        payslip.status ===
        "published"
    ).length;

  const draftPayslips =
    currentMonthPayslips.filter(
      (payslip) =>
        payslip.status ===
        "draft"
    ).length;

  return {
    period: {
      date:
        today
          .toISOString()
          .split("T")[0],

      month:
        currentMonth,

      year:
        currentYear,
    },

    employees: {
      total:
        totalEmployees,

      active:
        activeEmployees,

      inactive:
        totalEmployees -
        activeEmployees,
    },

    attendance: {
      presentToday,
      lateToday,

      totalCheckedInToday:
        todayAttendances.length,
    },

    requests: {
      pending:
        pendingRequests,
    },

    payroll: {
      totalPayslips:
        currentMonthPayslips.length,

      published:
        publishedPayslips,

      draft:
        draftPayslips,

      totalTakeHomePay:
        totalPayroll,
    },

    announcements: {
      published:
        publishedAnnouncements,
    },

    recentAttendance:
      recentAttendances.map(
        (attendance) => ({
          id:
            attendance.id.toString(),

          employee: {
            id:
              attendance
                .schedule
                .employee
                .id
                .toString(),

            employeeNumber:
              attendance
                .schedule
                .employee
                .employeeNumber,

            name: [
              attendance
                .schedule
                .employee
                .firstName,

              attendance
                .schedule
                .employee
                .lastName,
            ]
              .filter(Boolean)
              .join(" "),
          },

          office:
            attendance
              .schedule
              .office
              .name,

          status:
            attendance.status,

          workDate:
            attendance
              .schedule
              .workDate
              .toISOString()
              .split("T")[0],

          checkInTime:
            formatTime(
              attendance.checkInAt
            ),

          checkOutTime:
            formatTime(
              attendance.checkOutAt
            ),
        })
      ),

    recentRequests:
      recentRequests.map(
        (request) => ({
          id:
            request.id.toString(),

          employee: {
            id:
              request
                .employee
                .id
                .toString(),

            employeeNumber:
              request
                .employee
                .employeeNumber,

            name: [
              request
                .employee
                .firstName,

              request
                .employee
                .lastName,
            ]
              .filter(Boolean)
              .join(" "),
          },

          type:
            request.type,

          status:
            request.status,

          submittedAt:
            request
              .submittedAt
              .toISOString(),
        })
      ),
  };
}