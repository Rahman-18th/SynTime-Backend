import prisma from "../config/prisma.js";

export async function getAllPayslips() {
  return prisma.payslip.findMany({
    include: {
      employee: true,
    },
    orderBy: [
      {
        periodYear: "desc",
      },
      {
        periodMonth: "desc",
      },
    ],
  });
}

export async function getPayslipById(
  id: bigint
) {
  return prisma.payslip.findUnique({
    where: {
      id,
    },
    include: {
      employee: true,
    },
  });
}

export async function getPayslipsByEmployee(
  employeeId: bigint
) {
  return prisma.payslip.findMany({
    where: {
      employeeId,
    },
    orderBy: [
      {
        periodYear: "desc",
      },
      {
        periodMonth: "desc",
      },
    ],
  });
}

export async function createPayslip(data: {
  employeeId: bigint;
  periodMonth: number;
  periodYear: number;
  basicSalary: number;
  totalIncome: number;
  totalDeduction: number;
  takeHomePay: number;
  status?: string;
}) {
  return prisma.payslip.create({
    data: {
      employeeId:
        data.employeeId,

      periodMonth:
        data.periodMonth,

      periodYear:
        data.periodYear,

      basicSalary:
        data.basicSalary,

      totalIncome:
        data.totalIncome,

      totalDeduction:
        data.totalDeduction,

      takeHomePay:
        data.takeHomePay,

      ...(data.status !== undefined && {
        status: data.status,
      }),
    },
  });
}