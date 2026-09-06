import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByCompany,
  updateDepartment,
} from "../services/department.service.js";

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

    const departments =
      typeof companyId === "string"
        ? await getDepartmentsByCompany(
            BigInt(companyId)
          )
        : await getAllDepartments();

    return successResponse(
      res,
      200,
      "Departments retrieved successfully",
      departments
    );
  } catch (error) {
    console.error(
      "Get departments error:",
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

    const department =
      await getDepartmentById(id);

    if (!department) {
      return errorResponse(
        res,
        404,
        "Department not found"
      );
    }

    return successResponse(
      res,
      200,
      "Department retrieved successfully",
      department
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid department ID"
      );
    }

    console.error(
      "Get department error:",
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
      description,
    } = req.body ?? {};

    if (!companyId || !name) {
      return errorResponse(
        res,
        400,
        "companyId and name are required"
      );
    }

    const department =
      await createDepartment({
        companyId:
          BigInt(companyId),

        name,

        ...(description !== undefined && {
          description,
        }),
      });

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "master_data.department_created",
      entityType: "department",
      entityId: department.id.toString(),
      description: `Created department ${department.name}`,
      metadata: {
        name: department.name,
        companyId: department.companyId.toString(),
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      201,
      "Department created successfully",
      department
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Department already exists in this company"
        );
      }

      if (error.code === "P2003") {
        return errorResponse(
          res,
          400,
          "Invalid company reference"
        );
      }
    }

    console.error(
      "Create department error:",
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
      await getDepartmentById(id);

    if (!existing) {
      return errorResponse(
        res,
        404,
        "Department not found"
      );
    }

    const {
      companyId,
      name,
      description,
    } = req.body ?? {};

    const department =
      await updateDepartment(
        id,
        {
          ...(companyId !== undefined && {
            companyId:
              BigInt(companyId),
          }),

          ...(name !== undefined && {
            name,
          }),

          ...(description !== undefined && {
            description,
          }),
        }
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "master_data.department_updated",
      entityType: "department",
      entityId: department.id.toString(),
      description: `Updated department ${department.name}`,
      metadata: {
        updatedFields: Object.keys(req.body ?? {}),
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Department updated successfully",
      department
    );
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "Department already exists in this company"
        );
      }
    }

    console.error(
      "Update department error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}