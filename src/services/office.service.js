import prisma from "../config/prisma.js";
function serializeOffice(office) {
    return {
        ...office,
        latitude: office.latitude === null
            ? null
            : Number(office.latitude),
        longitude: office.longitude === null
            ? null
            : Number(office.longitude),
    };
}
export async function getAllOffices() {
    const offices = await prisma.office.findMany({
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
    return offices.map(serializeOffice);
}
export async function getOfficeById(id) {
    const office = await prisma.office.findUnique({
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
    if (!office) {
        return null;
    }
    return serializeOffice(office);
}
export async function getOfficesByCompany(companyId) {
    const offices = await prisma.office.findMany({
        where: {
            companyId,
        },
        orderBy: {
            name: "asc",
        },
    });
    return offices.map(serializeOffice);
}
export async function createOffice(data) {
    return prisma.office.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            ...(data.address !== undefined && {
                address: data.address,
            }),
            ...(data.latitude !== undefined && {
                latitude: data.latitude,
            }),
            ...(data.longitude !== undefined && {
                longitude: data.longitude,
            }),
            ...(data.allowedRadiusMeters !== undefined && {
                allowedRadiusMeters: data.allowedRadiusMeters,
            }),
        },
    });
}
export async function updateOffice(id, data) {
    return prisma.office.update({
        where: {
            id,
        },
        data,
    });
}
//# sourceMappingURL=office.service.js.map