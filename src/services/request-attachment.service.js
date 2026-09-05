import prisma from "../config/prisma.js";
export async function createRequestAttachment(data) {
    return prisma.requestAttachment.create({
        data: {
            requestId: data.requestId,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            ...(data.fileType !== undefined && {
                fileType: data.fileType,
            }),
            ...(data.fileSize !== undefined && {
                fileSize: data.fileSize,
            }),
        },
    });
}
export async function getAttachmentsByRequest(requestId) {
    return prisma.requestAttachment.findMany({
        where: {
            requestId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
//# sourceMappingURL=request-attachment.service.js.map