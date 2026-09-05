import prisma from "../config/prisma.js";
export async function getAllShifts() {
    return prisma.shift.findMany({
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getShiftById(id) {
    return prisma.shift.findUnique({
        where: { id },
        include: {
            company: true,
        },
    });
}
export async function createShift(data) {
    return prisma.shift.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            ...(data.breakStart !== undefined && {
                breakStart: data.breakStart,
            }),
            ...(data.breakEnd !== undefined && {
                breakEnd: data.breakEnd,
            }),
        },
    });
}
export async function updateShift(id, data) {
    return prisma.shift.update({
        where: { id },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.startTime !== undefined && {
                startTime: data.startTime,
            }),
            ...(data.endTime !== undefined && {
                endTime: data.endTime,
            }),
            ...(data.breakStart !== undefined && {
                breakStart: data.breakStart,
            }),
            ...(data.breakEnd !== undefined && {
                breakEnd: data.breakEnd,
            }),
        },
    });
}
//# sourceMappingURL=shift.service.js.map