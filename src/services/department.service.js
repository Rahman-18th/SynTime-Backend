import prisma from "../config/prisma.js";
export async function getAllDepartments() {
    return prisma.department.findMany({
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}
export async function getDepartmentById(id) {
    return prisma.department.findUnique({
        where: {
            id,
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}
export async function getDepartmentsByCompany(companyId) {
    return prisma.department.findMany({
        where: {
            companyId,
        },
        orderBy: {
            name: "asc",
        },
    });
}
export async function createDepartment(data) {
    return prisma.department.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            ...(data.description !== undefined && {
                description: data.description,
            }),
        },
    });
}
export async function updateDepartment(id, data) {
    return prisma.department.update({
        where: {
            id,
        },
        data,
    });
}
//# sourceMappingURL=department.service.js.map