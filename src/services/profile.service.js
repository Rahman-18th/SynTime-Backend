import prisma from "../config/prisma.js";
export async function getEmployeeProfile(employeeId) {
    return prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
        include: {
            company: true,
            department: true,
            office: true,
            user: true,
        },
    });
}
export async function updateEmployeeProfile(employeeId, data) {
    return prisma.$transaction(async (tx) => {
        const updateData = {
            firstName: data.firstName,
            email: data.email,
        };
        if (data.lastName !== undefined) {
            updateData.lastName =
                data.lastName;
        }
        if (data.phone !== undefined) {
            updateData.phone =
                data.phone;
        }
        await tx.employee.update({
            where: {
                id: employeeId,
            },
            data: updateData,
        });
        await tx.user.updateMany({
            where: {
                employeeId,
            },
            data: {
                email: data.email,
            },
        });
        return tx.employee.findUnique({
            where: {
                id: employeeId,
            },
            include: {
                company: true,
                department: true,
                office: true,
                user: true,
            },
        });
    });
}
//# sourceMappingURL=profile.service.js.map