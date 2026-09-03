import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

export async function createNotification(data: {
  employeeId: bigint;
  title: string;
  message: string;
  type?: string;
}) {
  return prisma.notification.create({
    data: {
      employeeId:
        data.employeeId,

      title:
        data.title,

      message:
        data.message,

      ...(data.type !== undefined && {
        type:
          data.type,
      }),
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get All Notifications - Admin / HR
|--------------------------------------------------------------------------
*/

export async function getAllNotifications() {
  return prisma.notification.findMany({
    include: {
      employee: {
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get Employee Notifications
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Mark Employee Notification As Read
|--------------------------------------------------------------------------
*/

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