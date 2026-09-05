import prisma from "../config/prisma.js";
/*
|--------------------------------------------------------------------------
| Employee Queries
|--------------------------------------------------------------------------
*/
export async function getAllEmployees() {
    return prisma.employee.findMany({
        include: {
            company: true,
            department: true,
            office: true,
            user: {
                select: {
                    id: true,
                    employeeId: true,
                    email: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getEmployeeById(id) {
    return prisma.employee.findUnique({
        where: {
            id,
        },
        include: {
            company: true,
            department: true,
            office: true,
            user: {
                select: {
                    id: true,
                    employeeId: true,
                    email: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            },
            schedules: true,
        },
    });
}
/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
*/
export async function createEmployee(data) {
    return prisma.employee.create({
        data: {
            companyId: data.companyId,
            departmentId: data.departmentId,
            officeId: data.officeId,
            employeeNumber: data.employeeNumber,
            firstName: data.firstName,
            email: data.email,
            ...(data.lastName !==
                undefined && {
                lastName: data.lastName,
            }),
            ...(data.phone !==
                undefined && {
                phone: data.phone,
            }),
            ...(data.position !==
                undefined && {
                position: data.position,
            }),
            ...(data.workType !==
                undefined && {
                workType: data.workType,
            }),
            ...(data.joinDate !==
                undefined && {
                joinDate: data.joinDate,
            }),
        },
    });
}
/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
*/
export async function updateEmployee(id, data) {
    return prisma.employee.update({
        where: {
            id,
        },
        data: {
            ...(data.departmentId !==
                undefined && {
                departmentId: data.departmentId,
            }),
            ...(data.officeId !==
                undefined && {
                officeId: data.officeId,
            }),
            ...(data.firstName !==
                undefined && {
                firstName: data.firstName,
            }),
            ...(data.lastName !==
                undefined && {
                lastName: data.lastName,
            }),
            ...(data.email !==
                undefined && {
                email: data.email,
            }),
            ...(data.phone !==
                undefined && {
                phone: data.phone,
            }),
            ...(data.position !==
                undefined && {
                position: data.position,
            }),
            ...(data.workType !==
                undefined && {
                workType: data.workType,
            }),
            ...(data.joinDate !==
                undefined && {
                joinDate: data.joinDate,
            }),
        },
    });
}
/*
|--------------------------------------------------------------------------
| Update Employee Status
|--------------------------------------------------------------------------
*/
export async function updateEmployeeStatus(id, status) {
    return prisma.employee.update({
        where: {
            id,
        },
        data: {
            status,
        },
    });
}
//# sourceMappingURL=employee.service.js.map