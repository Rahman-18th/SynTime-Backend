import prisma from "../config/prisma.js";
/*
|--------------------------------------------------------------------------
| Get all payslips
|--------------------------------------------------------------------------
*/
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
/*
|--------------------------------------------------------------------------
| Get payslip by ID
|--------------------------------------------------------------------------
*/
export async function getPayslipById(id) {
    return prisma.payslip.findUnique({
        where: {
            id,
        },
        include: {
            employee: true,
        },
    });
}
/*
|--------------------------------------------------------------------------
| Get all payslips by employee
|--------------------------------------------------------------------------
*/
export async function getPayslipsByEmployee(employeeId) {
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
/*
|--------------------------------------------------------------------------
| Get published payslips by employee
|--------------------------------------------------------------------------
*/
export async function getPublishedPayslipsByEmployee(employeeId) {
    return prisma.payslip.findMany({
        where: {
            employeeId,
            status: "published",
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
/*
|--------------------------------------------------------------------------
| Create payslip
|--------------------------------------------------------------------------
*/
export async function createPayslip(data) {
    const takeHomePay = data.totalIncome -
        data.totalDeduction;
    return prisma.payslip.create({
        data: {
            employeeId: data.employeeId,
            periodMonth: data.periodMonth,
            periodYear: data.periodYear,
            basicSalary: data.basicSalary,
            totalIncome: data.totalIncome,
            totalDeduction: data.totalDeduction,
            takeHomePay,
            ...(data.status !== undefined && {
                status: data.status,
            }),
        },
    });
}
/*
|--------------------------------------------------------------------------
| Update payslip
|--------------------------------------------------------------------------
*/
export async function updatePayslip(id, data) {
    const existingPayslip = await prisma.payslip.findUnique({
        where: {
            id,
        },
    });
    if (!existingPayslip) {
        throw new Error("PAYSLIP_NOT_FOUND");
    }
    const totalIncome = data.totalIncome ??
        Number(existingPayslip.totalIncome);
    const totalDeduction = data.totalDeduction ??
        Number(existingPayslip.totalDeduction);
    const takeHomePay = totalIncome -
        totalDeduction;
    return prisma.payslip.update({
        where: {
            id,
        },
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
            ...(data.status !== undefined && {
                status: data.status,
            }),
            takeHomePay,
        },
    });
}
//# sourceMappingURL=payslip.service.js.map