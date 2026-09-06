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

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function parseId(
  value:
    | string
    | string[]
    | undefined
): bigint {
  if (
    !value ||
    Array.isArray(value)
  ) {
    throw new Error(
      "INVALID_ID"
    );
  }

  try {
    return BigInt(value);
  } catch {
    throw new Error(
      "INVALID_ID"
    );
  }
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string
): number | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    throw new Error(
      `INVALID_${fieldName.toUpperCase()}`
    );
  }

  return parsed;
}

function validateLatitude(
  value: number
) {
  if (
    value < -90 ||
    value > 90
  ) {
    throw new Error(
      "INVALID_LATITUDE"
    );
  }
}

function validateLongitude(
  value: number
) {
  if (
    value < -180 ||
    value > 180
  ) {
    throw new Error(
      "INVALID_LONGITUDE"
    );
  }
}

function validateRadius(
  value: number
) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 10000
  ) {
    throw new Error(
      "INVALID_RADIUS"
    );
  }
}

function handleValidationError(
  error: unknown,
  res: Response
) {
  if (!(error instanceof Error)) {
    return false;
  }

  switch (error.message) {
    case "INVALID_ID":
      errorResponse(
        res,
        400,
        "Invalid office or company ID"
      );
      return true;

    case "INVALID_LATITUDE":
      errorResponse(
        res,
        400,
        "Latitude must be between -90 and 90"
      );
      return true;

    case "INVALID_LONGITUDE":
      errorResponse(
        res,
        400,
        "Longitude must be between -180 and 180"
      );
      return true;

    case "INVALID_RADIUS":
      errorResponse(
        res,
        400,
        "Allowed radius must be an integer between 1 and 10000 meters"
      );
      return true;

    default:
      return false;
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/offices
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const companyId =
      req.query.companyId;

    const offices =
      typeof companyId ===
      "string"
        ? await getOfficesByCompany(
            parseId(
              companyId
            )
          )
        : await getAllOffices();

    return successResponse(
      res,
      200,
      "Offices retrieved successfully",
      offices
    );
  } catch (error) {
    if (
      handleValidationError(
        error,
        res
      )
    ) {
      return;
    }

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

/*
|--------------------------------------------------------------------------
| GET /api/offices/:id
|--------------------------------------------------------------------------
*/

export async function show(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseId(
        req.params.id
      );

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
      handleValidationError(
        error,
        res
      )
    ) {
      return;
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

/*
|--------------------------------------------------------------------------
| POST /api/offices
|--------------------------------------------------------------------------
*/

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

    if (
      !companyId ||
      typeof name !==
        "string" ||
      !name.trim()
    ) {
      return errorResponse(
        res,
        400,
        "companyId and name are required"
      );
    }

    const parsedCompanyId =
      parseId(
        String(companyId)
      );

    const parsedLatitude =
      parseOptionalNumber(
        latitude,
        "latitude"
      );

    const parsedLongitude =
      parseOptionalNumber(
        longitude,
        "longitude"
      );

    const parsedRadius =
      parseOptionalNumber(
        allowedRadiusMeters,
        "radius"
      );

    if (
      (
        parsedLatitude ===
          undefined
      ) !==
      (
        parsedLongitude ===
          undefined
      )
    ) {
      return errorResponse(
        res,
        400,
        "Latitude and longitude must be provided together"
      );
    }

    if (
      parsedLatitude !==
      undefined
    ) {
      validateLatitude(
        parsedLatitude
      );
    }

    if (
      parsedLongitude !==
      undefined
    ) {
      validateLongitude(
        parsedLongitude
      );
    }

    if (
      parsedRadius !==
      undefined
    ) {
      validateRadius(
        parsedRadius
      );
    }

    const office =
      await createOffice({
        companyId:
          parsedCompanyId,

        name:
          name.trim(),

        ...(typeof address ===
          "string" && {
          address:
            address.trim(),
        }),

        ...(parsedLatitude !==
          undefined && {
          latitude:
            parsedLatitude,
        }),

        ...(parsedLongitude !==
          undefined && {
          longitude:
            parsedLongitude,
        }),

        ...(parsedRadius !==
          undefined && {
          allowedRadiusMeters:
            parsedRadius,
        }),
      });

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId:
          BigInt(
            req.user.userId
          ),
      }),

      action:
        "master_data.office_created",

      entityType:
        "office",

      entityId:
        office.id.toString(),

      description:
        `Created office ${office.name}`,

      metadata: {
        name:
          office.name,

        companyId:
          office.companyId.toString(),
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
    if (
      handleValidationError(
        error,
        res
      )
    ) {
      return;
    }

    if (
      isPrismaKnownError(
        error
      )
    ) {
      if (
        error.code ===
        "P2003"
      ) {
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

/*
|--------------------------------------------------------------------------
| PUT /api/offices/:id
|--------------------------------------------------------------------------
*/

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    const id =
      parseId(
        req.params.id
      );

    if (
      !req.body ||
      Object.keys(
        req.body
      ).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
    }

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
    } = req.body;

    if (
      name !== undefined &&
      (
        typeof name !==
          "string" ||
        !name.trim()
      )
    ) {
      return errorResponse(
        res,
        400,
        "Office name cannot be empty"
      );
    }

    let parsedCompanyId:
      | bigint
      | undefined;

    if (
      companyId !==
      undefined
    ) {
      parsedCompanyId =
        parseId(
          String(companyId)
        );
    }

    const parsedLatitude =
      latitude === null
        ? null
        : parseOptionalNumber(
            latitude,
            "latitude"
          );

    const parsedLongitude =
      longitude === null
        ? null
        : parseOptionalNumber(
            longitude,
            "longitude"
          );

    const parsedRadius =
      parseOptionalNumber(
        allowedRadiusMeters,
        "radius"
      );

    if (
      typeof parsedLatitude ===
      "number"
    ) {
      validateLatitude(
        parsedLatitude
      );
    }

    if (
      typeof parsedLongitude ===
      "number"
    ) {
      validateLongitude(
        parsedLongitude
      );
    }

    if (
      parsedRadius !==
      undefined
    ) {
      validateRadius(
        parsedRadius
      );
    }

    if (
      (
        parsedLatitude ===
          null
      ) !==
      (
        parsedLongitude ===
          null
      )
    ) {
      return errorResponse(
        res,
        400,
        "Latitude and longitude must be cleared together"
      );
    }

 const updateData = {
  ...(parsedCompanyId !==
    undefined && {
    companyId:
      parsedCompanyId,
  }),

  ...(name !==
    undefined && {
    name:
      name.trim(),
  }),

  ...(address !==
    undefined && {
    address:
      address === null
        ? null
        : String(
            address
          ).trim(),
  }),

  ...(parsedLatitude !==
    undefined && {
    latitude:
      parsedLatitude,
  }),

  ...(parsedLongitude !==
    undefined && {
    longitude:
      parsedLongitude,
  }),

  ...(parsedRadius !==
    undefined && {
    allowedRadiusMeters:
      parsedRadius,
  }),
};

    if (
      Object.keys(
        updateData
      ).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "No valid fields provided for update"
      );
    }

    const office =
      await updateOffice(
        id,
        updateData
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId:
          BigInt(
            req.user.userId
          ),
      }),

      action:
        "master_data.office_updated",

      entityType:
        "office",

      entityId:
        office.id.toString(),

      description:
        `Updated office ${office.name}`,

      metadata: {
        updatedFields:
          Object.keys(
            updateData
          ),
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
    if (
      handleValidationError(
        error,
        res
      )
    ) {
      return;
    }

    if (
      isPrismaKnownError(
        error
      )
    ) {
      if (
        error.code ===
        "P2003"
      ) {
        return errorResponse(
          res,
          400,
          "Invalid company reference"
        );
      }

      if (
        error.code ===
        "P2025"
      ) {
        return errorResponse(
          res,
          404,
          "Office not found"
        );
      }
    }

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