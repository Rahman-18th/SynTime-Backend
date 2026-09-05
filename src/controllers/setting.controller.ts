import type {
  Request,
  Response,
} from "express";

import {
  getAllSettings,
  updateSettings,
} from "../services/setting.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

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

export async function update(
  req: Request,
  res: Response
) {
  try {
    const {
      timezone,
      default_company_id,
      default_office_id,
      default_attendance_radius,
      system_name,
    } = req.body ?? {};

    const payload: Record<
      string,
      string
    > = {};

    if (
      typeof timezone ===
      "string"
    ) {
      payload.timezone =
        timezone.trim();
    }

    if (
      typeof default_company_id ===
      "string"
    ) {
      payload.default_company_id =
        default_company_id.trim();
    }

    if (
      typeof default_office_id ===
      "string"
    ) {
      payload.default_office_id =
        default_office_id.trim();
    }

    if (
      typeof default_attendance_radius ===
      "string"
    ) {
      payload.default_attendance_radius =
        default_attendance_radius.trim();
    }

    if (
      typeof system_name ===
      "string"
    ) {
      payload.system_name =
        system_name.trim();
    }

    if (
      Object.keys(payload)
        .length === 0
    ) {
      return errorResponse(
        res,
        400,
        "No valid settings provided"
      );
    }

    const settings =
      await updateSettings(
        payload
      );

    return successResponse(
      res,
      200,
      "Settings updated successfully",
      settings
    );
  } catch (error) {
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