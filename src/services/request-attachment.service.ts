import prisma from "../config/prisma.js";

export async function createRequestAttachment(data: {
  requestId: bigint;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: bigint;
}) {
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

export async function getAttachmentsByRequest(
  requestId: bigint
) {
  return prisma.requestAttachment.findMany({
    where: {
      requestId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}