import prisma from "../config/prisma.js";

export async function createNotification(data: {
  employeeId: bigint;
  title: string;
  message: string;
  type?: string;
}) {
  return prisma.notification.create({
    data: {
      employeeId: data.employeeId,
      title: data.title,
      message: data.message,

      ...(data.type !== undefined && {
        type: data.type,
      }),
    },
  });
}

export async function getNotificationsByEmployee(
  employeeId: bigint
) {
  return prisma.notification.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function markNotificationAsRead(
  id: bigint,
  employeeId: bigint
) {
  return prisma.notification.updateMany({
    where: {
      id,
      employeeId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}