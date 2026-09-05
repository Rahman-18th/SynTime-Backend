import prisma from "../config/prisma.js";
/*
|--------------------------------------------------------------------------
| Shared Includes
|--------------------------------------------------------------------------
*/
const requestInclude = {
    employee: true,
    reviewer: {
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
    attachments: true,
};
/*
|--------------------------------------------------------------------------
| Get All Requests
|--------------------------------------------------------------------------
*/
export async function getAllRequests() {
    return prisma.request.findMany({
        include: requestInclude,
        orderBy: {
            submittedAt: "desc",
        },
    });
}
/*
|--------------------------------------------------------------------------
| Get Request By ID
|--------------------------------------------------------------------------
*/
export async function getRequestById(id) {
    return prisma.request.findUnique({
        where: {
            id,
        },
        include: requestInclude,
    });
}
/*
|--------------------------------------------------------------------------
| Get Employee Requests
|--------------------------------------------------------------------------
*/
export async function getRequestsByEmployee(employeeId) {
    return prisma.request.findMany({
        where: {
            employeeId,
        },
        include: {
            reviewer: {
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
            attachments: true,
        },
        orderBy: {
            submittedAt: "desc",
        },
    });
}
/*
|--------------------------------------------------------------------------
| Create Request
|--------------------------------------------------------------------------
*/
export async function createRequest(data) {
    return prisma.request.create({
        data: {
            employeeId: data.employeeId,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            status: "pending",
        },
    });
}
/*
|--------------------------------------------------------------------------
| Review Request
|--------------------------------------------------------------------------
*/
export async function reviewRequest(id, data) {
    return prisma.request.update({
        where: {
            id,
        },
        data: {
            reviewedBy: data.reviewedBy,
            status: data.status,
            reviewedAt: data.reviewedAt,
            ...(data.reviewNote !==
                undefined && {
                reviewNote: data.reviewNote,
            }),
        },
    });
}
//# sourceMappingURL=request.service.js.map