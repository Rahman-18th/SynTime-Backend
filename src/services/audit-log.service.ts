import prisma from "../config/prisma.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";

export interface CreateAuditLogData {
  actorUserId?: bigint;

  action: string;

  entityType: string;
  entityId?: string;

  description: string;

  metadata?:
    Prisma.InputJsonObject;

  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQueryOptions {
  page?: number;
  limit?: number;

  search?: string;

  action?: string;
  entityType?: string;

  dateFrom?: Date;
  dateTo?: Date;
}

export async function createAuditLog(
  data: CreateAuditLogData
) {
  return prisma.auditLog.create({
    data: {
      ...(data.actorUserId !==
        undefined && {
        actorUserId:
          data.actorUserId,
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

export async function getAuditLogs(
  options: AuditLogQueryOptions = {}
) {
  const where:
    Prisma.AuditLogWhereInput = {};

  if (options.search) {
    const search =
      options.search.trim();

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          entityType: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          entityId: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          actor: {
            is: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }
  }

  if (options.action) {
    where.action =
      options.action;
  }

  if (options.entityType) {
    where.entityType =
      options.entityType;
  }

  if (
    options.dateFrom ||
    options.dateTo
  ) {
    where.createdAt = {
      ...(options.dateFrom && {
        gte:
          options.dateFrom,
      }),

      ...(options.dateTo && {
        lt:
          options.dateTo,
      }),
    };
  }

  const paginationEnabled =
    options.page !== undefined ||
    options.limit !== undefined;

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 25;

  const [
    items,
    total,
  ] =
    await prisma.$transaction([
      prisma.auditLog.findMany({
        where,

        include: {
          actor: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              isActive: true,

              employee: {
                select: {
                  id: true,
                  employeeNumber: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },

        ...(paginationEnabled && {
          skip:
            (page - 1) *
            limit,

          take: limit,
        }),
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

  return {
    items,
    total,
    page,
    limit,
    paginationEnabled,
  };
}