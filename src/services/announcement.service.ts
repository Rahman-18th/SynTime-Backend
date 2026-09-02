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

export async function getAnnouncementById(
  id: bigint,
) {
  return prisma.announcement.findUnique({
    where: {
      id,
    },
  });
}

interface CreateAnnouncementInput {
  title: string;
  message: string;
  priority?: string;
  isPublished?: boolean;
}

export async function createAnnouncement(
  data: CreateAnnouncementInput,
) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      message: data.message,
      priority: data.priority ?? "normal",
      isPublished:
          data.isPublished ?? false,
    },
  });
}

interface UpdateAnnouncementInput {
  title?: string;
  message?: string;
  priority?: string;
  isPublished?: boolean;
}

export async function updateAnnouncement(
  id: bigint,
  data: UpdateAnnouncementInput,
) {
  return prisma.announcement.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteAnnouncement(
  id: bigint,
) {
  return prisma.announcement.delete({
    where: {
      id,
    },
  });
}