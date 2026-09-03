import type {
  Request,
  Response,
} from "express";

import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} from "../services/company.service.js";

import {
  errorResponse,
  successResponse,
} from "../utils/api-response.js";

import {
  isPrismaKnownError,
} from "../utils/prisma-error.js";

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
    const companies =
      await getAllCompanies();

    return successResponse(
      res,
      200,
      "Companies retrieved successfully",
      companies
    );
  } catch (error) {
    console.error(
      "Get companies error:",
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

    const company =
      await getCompanyById(id);

    if (!company) {
      return errorResponse(
        res,
        404,
        "Company not found"
      );
    }

    return successResponse(
      res,
      200,
      "Company retrieved successfully",
      company
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid company ID"
      );
    }

    console.error(
      "Get company error:",
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
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      address,
      phone,
      email,
    } = req.body ?? {};

    if (!name) {
      return errorResponse(
        res,
        400,
        "Company name is required"
      );
    }

    const company =
      await createCompany({
        name,

        ...(address !== undefined && {
          address,
        }),

        ...(phone !== undefined && {
          phone,
        }),

        ...(email !== undefined && {
          email,
        }),
      });

    return successResponse(
      res,
      201,
      "Company created successfully",
      company
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Company already exists"
        );
      }
    }

    console.error(
      "Create company error:",
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
    const id =
      parseId(req.params.id);

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Request body is required"
      );
    }

    const existingCompany =
      await getCompanyById(id);

    if (!existingCompany) {
      return errorResponse(
        res,
        404,
        "Company not found"
      );
    }

    const company =
      await updateCompany(
        id,
        req.body
      );

    return successResponse(
      res,
      200,
      "Company updated successfully",
      company
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid company ID"
      );
    }

    console.error(
      "Update company error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}