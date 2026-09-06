import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createOffice,
  getAllOffices,
  getOfficeById,
  getOfficesByCompany,
  updateOffice,
} from "../services/office.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

import {
  writeAuditLog,
} from "../utils/audit.js";

import {
  getAuditContext,
} from "../utils/audit-context.js";

function parseId(
  id: string | string[] | undefined
): bigint {
  if (!id || Array.isArray(id)) {
    throw new Error("INVALID_ID");
  }

  try {
    return BigInt(id);
  } catch {
    throw new Error("INVALID_ID");
  }
}

export async function index(
  req: Request,
  res: Response
) {
  try {
    const companyId =
      req.query.companyId;

    const offices =
      typeof companyId === "string"
        ? await getOfficesByCompany(
            BigInt(companyId)
          )
        : await getAllOffices();

    return successResponse(
      res,
      200,
      "Offices retrieved successfully",
      offices
    );
  } catch (error) {
    console.error(
      "Get offices error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

    const office =
      await getOfficeById(id);

    if (!office) {
      return errorResponse(
        res,
        404,
        "Office not found"
      );
    }

    return successResponse(
      res,
      200,
      "Office retrieved successfully",
      office
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid office ID"
      );
    }

    console.error(
      "Get office error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function store(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      companyId,
      name,
      address,
      latitude,
      longitude,
      allowedRadiusMeters,
    } = req.body ?? {};

    if (!companyId || !name) {
      return errorResponse(
        res,
        400,
        "companyId and name are required"
      );
    }

    const office =
      await createOffice({
        companyId:
          BigInt(companyId),

        name,

        ...(address !== undefined && {
          address,
        }),

        ...(latitude !== undefined && {
          latitude:
            Number(latitude),
        }),

        ...(longitude !== undefined && {
          longitude:
            Number(longitude),
        }),

        ...(allowedRadiusMeters !== undefined && {
          allowedRadiusMeters:
            Number(
              allowedRadiusMeters
            ),
        }),
      });

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "master_data.office_created",
      entityType: "office",
      entityId: office.id.toString(),
      description: `Created office ${office.name}`,
      metadata: {
        name: office.name,
        companyId: office.companyId.toString(),
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      201,
      "Office created successfully",
      office
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid company reference"
        );
      }
    }

    console.error(
      "Create office error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

    const existing =
      await getOfficeById(id);

    if (!existing) {
      return errorResponse(
        res,
        404,
        "Office not found"
      );
    }

    const {
      companyId,
      name,
      address,
      latitude,
      longitude,
      allowedRadiusMeters,
    } = req.body ?? {};

    const office =
      await updateOffice(
        id,
        {
          ...(companyId !== undefined && {
            companyId:
              BigInt(companyId),
          }),

          ...(name !== undefined && {
            name,
          }),

          ...(address !== undefined && {
            address,
          }),

          ...(latitude !== undefined && {
            latitude:
              latitude === null
                ? null
                : Number(latitude),
          }),

          ...(longitude !== undefined && {
            longitude:
              longitude === null
                ? null
                : Number(longitude),
          }),

          ...(allowedRadiusMeters !== undefined && {
            allowedRadiusMeters:
              Number(
                allowedRadiusMeters
              ),
          }),
        }
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "master_data.office_updated",
      entityType: "office",
      entityId: office.id.toString(),
      description: `Updated office ${office.name}`,
      metadata: {
        updatedFields: Object.keys(req.body ?? {}),
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Office updated successfully",
      office
    );
  } catch (error) {
    console.error(
      "Update office error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}