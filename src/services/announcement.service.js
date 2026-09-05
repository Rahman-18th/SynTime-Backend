import prisma from "../config/prisma.js";
export async function getPublishedAnnouncements() {
    return prisma.announcement.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getAllAnnouncements() {
    return prisma.announcement.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getAnnouncementById(id) {
    return prisma.announcement.findUnique({
        where: {
            id,
        },
    });
}
export async function createAnnouncement(data) {
    return prisma.announcement.create({
        data: {
            title: data.title,
            message: data.message,
            priority: data.priority ?? "normal",
            isPublished: data.isPublished ?? false,
        },
    });
}
export async function updateAnnouncement(id, data) {
    return prisma.announcement.update({
        where: {
            id,
        },
        data,
    });
}
export async function deleteAnnouncement(id) {
    return prisma.announcement.delete({
        where: {
            id,
        },
    });
}
//# sourceMappingURL=announcement.service.js.map