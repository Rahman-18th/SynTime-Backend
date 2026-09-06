import prisma from "../config/prisma.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";

interface CreateAuditLogData {
  actorUserId?: bigint;

  action: string;

  entityType: string;
  entityId?: string;

  description: string;

  metadata?: Prisma.InputJsonObject;

  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(
  data: CreateAuditLogData
) {
  return prisma.auditLog.create({
    data: {
      ...(data.actorUserId !==
        undefined && {
        actor: {
          connect: {
            id:
              data.actorUserId,
          },
        },
      }),

      action:
        data.action,

      entityType:
        data.entityType,

      ...(data.entityId !==
        undefined && {
        entityId:
          data.entityId,
      }),

      description:
        data.description,

      ...(data.metadata !==
        undefined && {
        metadata:
          data.metadata,
      }),

      ...(data.ipAddress !==
        undefined && {
        ipAddress:
          data.ipAddress,
      }),

      ...(data.userAgent !==
        undefined && {
        userAgent:
          data.userAgent,
      }),
    },
  });
}