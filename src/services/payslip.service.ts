import prisma from "../config/prisma.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";

interface PayslipQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  month?: number;
  year?: number;
}

export async function getAllPayslips(
  options: PayslipQueryOptions = {}
) {
  const baseWhere: Prisma.PayslipWhereInput = {};

  if (options.search) {
    const search = options.search.trim();

    if (search) {
      baseWhere.employee = {
        is: {
          OR: [
            { employeeNumber: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }
  }

  if (options.month !== undefined) {
    baseWhere.periodMonth = options.month;
  }

  if (options.year !== undefined) {
    baseWhere.periodYear = options.year;
  }

  const where: Prisma.PayslipWhereInput = {
    ...baseWhere,
    ...(options.status && { status: options.status }),
  };

  const paginationEnabled =
    options.page !== undefined || options.limit !== undefined;
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;

  const [
    payslips,
    total,
    totalRecords,
    published,
    draft,
    payrollAggregate,
  ] = await prisma.$transaction([
    prisma.payslip.findMany({
      where,
      include: { employee: true },
      orderBy: [
        { periodYear: "desc" },
        { periodMonth: "desc" },
        { createdAt: "desc" },
      ],
      ...(paginationEnabled && {
        skip: (page - 1) * limit,
        take: limit,
      }),
    }),
    prisma.payslip.count({ where }),
    prisma.payslip.count({ where: baseWhere }),
    prisma.payslip.count({ where: { ...baseWhere, status: "published" } }),
    prisma.payslip.count({ where: { ...baseWhere, status: "draft" } }),
    prisma.payslip.aggregate({
      where: baseWhere,
      _sum: { takeHomePay: true },
    }),
  ]);

  return {
    payslips,
    total,
    paginationEnabled,
    page,
    limit,
    summary: {
      totalRecords,
      published,
      draft,
      totalTakeHomePay: Number(payrollAggregate._sum.takeHomePay ?? 0),
    },
  };
}

export async function getPayslipById(
  id: bigint
) {
  return prisma.payslip.findUnique({
    where: { id },
    include: { employee: true },
  });
}

export async function getPayslipsByEmployee(
  employeeId: bigint
) {
  return prisma.payslip.findMany({
    where: { employeeId },
    orderBy: [
      { periodYear: "desc" },
      { periodMonth: "desc" },
    ],
  });
}

export async function getPublishedPayslipsByEmployee(
  employeeId: bigint
) {
  return prisma.payslip.findMany({
    where: { employeeId, status: "published" },
    orderBy: [
      { periodYear: "desc" },
      { periodMonth: "desc" },
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
  status?: string;
}) {
  const takeHomePay = data.totalIncome - data.totalDeduction;

  return prisma.payslip.create({
    data: {
      employeeId: data.employeeId,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      basicSalary: data.basicSalary,
      totalIncome: data.totalIncome,
      totalDeduction: data.totalDeduction,
      takeHomePay,
      ...(data.status !== undefined && { status: data.status }),
    },
  });
}

export async function updatePayslip(
  id: bigint,
  data: {
    basicSalary?: number;
    totalIncome?: number;
    totalDeduction?: number;
    status?: string;
  }
) {
  const existingPayslip = await prisma.payslip.findUnique({
    where: { id },
  });

  if (!existingPayslip) {
    throw new Error("PAYSLIP_NOT_FOUND");
  }

  const totalIncome =
    data.totalIncome ?? Number(existingPayslip.totalIncome);
  const totalDeduction =
    data.totalDeduction ?? Number(existingPayslip.totalDeduction);
  const takeHomePay = totalIncome - totalDeduction;

  return prisma.payslip.update({
    where: { id },
    data: {
      ...(data.basicSalary !== undefined && {
        basicSalary: data.basicSalary,
      }),
      ...(data.totalIncome !== undefined && {
        totalIncome: data.totalIncome,
      }),
      ...(data.totalDeduction !== undefined && {
        totalDeduction: data.totalDeduction,
      }),
      ...(data.status !== undefined && { status: data.status }),
      takeHomePay,
    },
  });
}
