import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  getAllSettings,
  updateSettings,
  validateSettingsReferences,
} from "../services/setting.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

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

function isValidTimezone(
  value: string
) {
  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          value,
      }
    );

    return true;
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/settings
|--------------------------------------------------------------------------
*/

export async function index(
  req: Request,
  res: Response
) {
  try {
    const settings =
      await getAllSettings();

    return successResponse(
      res,
      200,
      "Settings retrieved successfully",
      settings
    );
  } catch (error) {
    console.error(
      "Get settings error:",
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
| PUT /api/settings
|--------------------------------------------------------------------------
*/

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      timezone,
      default_company_id,
      default_office_id,
      default_attendance_radius,
      system_name,
    } =
      req.body ?? {};

    const payload:
      Record<
        string,
        string
      > = {};

    /*
    |--------------------------------------------------------------------------
    | Timezone
    |--------------------------------------------------------------------------
    */

    if (
      timezone !==
      undefined
    ) {
      if (
        typeof timezone !==
        "string"
      ) {
        return errorResponse(
          res,
          400,
          "Timezone must be a string"
        );
      }

      const value =
        timezone.trim();

      if (
        !value ||
        !isValidTimezone(
          value
        )
      ) {
        return errorResponse(
          res,
          400,
          "Invalid timezone"
        );
      }

      payload.timezone =
        value;
    }

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    if (
      default_company_id !==
      undefined
    ) {
      if (
        typeof default_company_id !==
        "string"
      ) {
        return errorResponse(
          res,
          400,
          "Default company ID must be a string"
        );
      }

      payload.default_company_id =
        default_company_id
          .trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Office
    |--------------------------------------------------------------------------
    */

    if (
      default_office_id !==
      undefined
    ) {
      if (
        typeof default_office_id !==
        "string"
      ) {
        return errorResponse(
          res,
          400,
          "Default office ID must be a string"
        );
      }

      payload.default_office_id =
        default_office_id
          .trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Attendance radius
    |--------------------------------------------------------------------------
    */

    if (
      default_attendance_radius !==
      undefined
    ) {
      if (
        typeof default_attendance_radius !==
        "string"
      ) {
        return errorResponse(
          res,
          400,
          "Default attendance radius must be a string"
        );
      }

      const rawRadius =
        default_attendance_radius
          .trim();

      const radius =
        Number(
          rawRadius
        );

      if (
        !Number.isInteger(
          radius
        ) ||
        radius < 1 ||
        radius > 10000
      ) {
        return errorResponse(
          res,
          400,
          "Default attendance radius must be an integer between 1 and 10000 meters"
        );
      }

      payload.default_attendance_radius =
        String(radius);
    }

    /*
    |--------------------------------------------------------------------------
    | System name
    |--------------------------------------------------------------------------
    */

    if (
      system_name !==
      undefined
    ) {
      if (
        typeof system_name !==
        "string"
      ) {
        return errorResponse(
          res,
          400,
          "System name must be a string"
        );
      }

      const value =
        system_name.trim();

      if (!value) {
        return errorResponse(
          res,
          400,
          "System name cannot be empty"
        );
      }

      if (
        value.length > 100
      ) {
        return errorResponse(
          res,
          400,
          "System name must not exceed 100 characters"
        );
      }

      payload.system_name =
        value;
    }

    if (
      Object.keys(
        payload
      ).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "No valid settings provided"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Merge with current settings for reference validation
    |--------------------------------------------------------------------------
    */

    const previousSettings =
      await getAllSettings();

    const mergedSettings = {
      ...previousSettings,
      ...payload,
    };

    await validateSettingsReferences(
      mergedSettings
    );

    const settings =
      await updateSettings(
        payload
      );

    const changedKeys =
      Object.keys(
        payload
      ).filter(
        (key) =>
          previousSettings[
            key as keyof typeof previousSettings
          ] !==
          payload[key]
      );

    if (
      changedKeys.length > 0
    ) {
      await writeAuditLog({
        ...(req.user?.userId && {
          actorUserId:
            BigInt(
              req.user.userId
            ),
        }),

        action:
          "settings.updated",

        entityType:
          "settings",

        description:
          "Updated system settings",

        metadata: {
          changedKeys,
        },

        ...getAuditContext(req),
      });
    }

    return successResponse(
      res,
      200,
      "Settings updated successfully",
      settings
    );
  } catch (error) {
    if (
      error instanceof Error
    ) {
      switch (
        error.message
      ) {
        case "INVALID_DEFAULT_COMPANY_ID":
          return errorResponse(
            res,
            400,
            "Invalid default company ID"
          );

        case "DEFAULT_COMPANY_NOT_FOUND":
          return errorResponse(
            res,
            400,
            "Default company does not exist"
          );

        case "INVALID_DEFAULT_OFFICE_ID":
          return errorResponse(
            res,
            400,
            "Invalid default office ID"
          );

        case "DEFAULT_OFFICE_NOT_FOUND":
          return errorResponse(
            res,
            400,
            "Default office does not exist"
          );

        case "OFFICE_COMPANY_MISMATCH":
          return errorResponse(
            res,
            400,
            "Default office does not belong to the selected default company"
          );
      }
    }

    console.error(
      "Update settings error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}