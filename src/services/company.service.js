import prisma from "../config/prisma.js";
export async function getAllCompanies() {
    return prisma.company.findMany({
        orderBy: {
            name: "asc",
        },
    });
}
export async function getCompanyById(id) {
    return prisma.company.findUnique({
        where: {
            id,
        },
    });
}
export async function createCompany(data) {
    return prisma.company.create({
        data: {
            name: data.name,
            ...(data.address !== undefined && {
                address: data.address,
            }),
            ...(data.phone !== undefined && {
                phone: data.phone,
            }),
            ...(data.email !== undefined && {
                email: data.email,
            }),
        },
    });
}
export async function updateCompany(id, data) {
    return prisma.company.update({
        where: {
            id,
        },
        data,
    });
}
//# sourceMappingURL=company.service.js.map