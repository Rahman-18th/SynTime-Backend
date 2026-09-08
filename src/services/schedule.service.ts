import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

async function validateScheduleReferences(
  employeeId: bigint,
  shiftId: bigint,
  officeId: bigint
) {
  const [
    employee,
    shift,
    office,
  ] = await Promise.all([
    prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        companyId: true,
      },
    }),

    prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
      select: {
        id: true,
        companyId: true,
      },
    }),

    prisma.office.findUnique({
      where: {
        id: officeId,
      },
      select: {
        id: true,
        companyId: true,
      },
    }),
  ]);

  if (
    !employee ||
    !shift ||
    !office
  ) {
    throw new Error(
      "INVALID_SCHEDULE_REFERENCE"
    );
  }

  if (
    employee.companyId !==
      shift.companyId ||
    employee.companyId !==
      office.companyId
  ) {
    throw new Error(
      "SCHEDULE_COMPANY_MISMATCH"
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET BY ID
|--------------------------------------------------------------------------
*/

export async function getScheduleById(
  id: bigint
) {
  return prisma.schedule.findUnique({
    where: {
      id,
    },
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export async function createSchedule(
  data: {
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status?: string;
  }
) {
  await validateScheduleReferences(
    data.employeeId,
    data.shiftId,
    data.officeId
  );

  return prisma.schedule.create({
    data: {
      employeeId:
        data.employeeId,

      shiftId:
        data.shiftId,

      officeId:
        data.officeId,

      workDate:
        data.workDate,

      ...(data.status !==
        undefined && {
        status:
          data.status,
      }),
    },
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

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
  const existing =
    await prisma.schedule.findUnique({
      where: {
        id,
      },
      select: {
        employeeId: true,
        shiftId: true,
        officeId: true,
      },
    });

  if (!existing) {
    throw new Error(
      "SCHEDULE_NOT_FOUND"
    );
  }

  const employeeId =
    data.employeeId ??
    existing.employeeId;

  const shiftId =
    data.shiftId ??
    existing.shiftId;

  const officeId =
    data.officeId ??
    existing.officeId;

  await validateScheduleReferences(
    employeeId,
    shiftId,
    officeId
  );

  return prisma.schedule.update({
    where: {
      id,
    },
    data: {
      ...(data.employeeId !==
        undefined && {
        employeeId:
          data.employeeId,
      }),

      ...(data.shiftId !==
        undefined && {
        shiftId:
          data.shiftId,
      }),

      ...(data.officeId !==
        undefined && {
        officeId:
          data.officeId,
      }),

      ...(data.workDate !==
        undefined && {
        workDate:
          data.workDate,
      }),

      ...(data.status !==
        undefined && {
        status:
          data.status,
      }),
    },
    include: {
      employee: true,
      shift: true,
      office: true,
      attendance: true,
    },
  });
}