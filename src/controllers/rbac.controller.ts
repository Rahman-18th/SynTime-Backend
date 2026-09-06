import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  assignPermissionToRole,
  assignRoleToUser,
  countActiveUsersWithRole,
  getAllPermissions,
  getAllRoles,
  getAllUsersWithRoles,
  getPermissionByName,
  getRoleById,
  getRoleByName,
  getUserForAudit,
  permissionExists,
  removePermissionFromRole,
  removeRoleFromUser,
  roleExists,
  userExists,
  userHasRole,
} from "../services/rbac.service.js";

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
| ID Parser
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

/*
|--------------------------------------------------------------------------
| GET /api/rbac/roles
|--------------------------------------------------------------------------
*/

export async function rolesIndex(
  req: Request,
  res: Response
) {
  try {
    const roles =
      await getAllRoles();

    return successResponse(
      res,
      200,
      "Roles retrieved successfully",
      roles
    );
  } catch (error) {
    console.error(
      "Get roles error:",
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
| GET /api/rbac/roles/:id
|--------------------------------------------------------------------------
*/

export async function roleShow(
  req: Request,
  res: Response
) {
  try {
    const id =
      parseId(req.params.id);

    const role =
      await getRoleById(id);

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    return successResponse(
      res,
      200,
      "Role retrieved successfully",
      role
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid role ID"
      );
    }

    console.error(
      "Get role error:",
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
| GET /api/rbac/permissions
|--------------------------------------------------------------------------
*/

export async function permissionsIndex(
  req: Request,
  res: Response
) {
  try {
    const permissions =
      await getAllPermissions();

    return successResponse(
      res,
      200,
      "Permissions retrieved successfully",
      permissions
    );
  } catch (error) {
    console.error(
      "Get permissions error:",
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
| GET /api/rbac/users
|--------------------------------------------------------------------------
*/

export async function usersIndex(
  req: Request,
  res: Response
) {
  try {
    const users =
      await getAllUsersWithRoles();

    return successResponse(
      res,
      200,
      "RBAC users retrieved successfully",
      users
    );
  } catch (error) {
    console.error(
      "Get RBAC users error:",
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
| POST /roles/:roleId/permissions/:permissionId
|--------------------------------------------------------------------------
*/

export async function assignPermission(
  req: AuthRequest,
  res: Response
) {
  try {
    const roleId =
      parseId(
        req.params.roleId
      );

    const permissionId =
      parseId(
        req.params.permissionId
      );

    const [
      role,
      permission,
    ] =
      await Promise.all([
        roleExists(roleId),
        permissionExists(
          permissionId
        ),
      ]);

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    if (!permission) {
      return errorResponse(
        res,
        404,
        "Permission not found"
      );
    }

    const result =
      await assignPermissionToRole(
        roleId,
        permissionId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "rbac.permission_assigned",
      entityType: "role",
      entityId: roleId.toString(),
      description: `Assigned permission ${result.permission.name} to role ${result.role.name}`,
      metadata: {
        roleId: roleId.toString(),
        roleName: result.role.name,
        permissionId: permissionId.toString(),
        permissionName: result.permission.name,
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Permission assigned to role successfully",
      result
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid role or permission ID"
      );
    }

    console.error(
      "Assign permission error:",
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
| DELETE /roles/:roleId/permissions/:permissionId
|--------------------------------------------------------------------------
*/
export async function removePermission(
  req: AuthRequest,
  res: Response
) {
  try {
    const roleId =
      parseId(
        req.params.roleId
      );

    const permissionId =
      parseId(
        req.params.permissionId
      );

    const [
      role,
      permission,
    ] =
      await Promise.all([
        roleExists(roleId),
        permissionExists(
          permissionId
        ),
      ]);

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    if (!permission) {
      return errorResponse(
        res,
        404,
        "Permission not found"
      );
    }

    const [
      adminRole,
      rbacViewPermission,
      rbacManagePermission,
    ] =
      await Promise.all([
        getRoleByName("admin"),
        getPermissionByName(
          "rbac.view"
        ),
        getPermissionByName(
          "rbac.manage"
        ),
      ]);

    const isAdminRole =
      adminRole?.id === roleId;

    const isProtectedPermission =
      permissionId ===
        rbacViewPermission?.id ||
      permissionId ===
        rbacManagePermission?.id;

    if (
      isAdminRole &&
      isProtectedPermission
    ) {
      return errorResponse(
        res,
        409,
        "Protected RBAC permission cannot be removed from the admin role"
      );
    }

    const [
      roleDetail,
      permissionDetails,
    ] = await Promise.all([
      getRoleById(roleId),
      getAllPermissions(),
    ]);

    const permissionDetail =
      permissionDetails.find(
        (item) => item.id === permissionId
      );

    const result =
      await removePermissionFromRole(
        roleId,
        permissionId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "rbac.permission_removed",
      entityType: "role",
      entityId: roleId.toString(),
      description: `Removed permission ${permissionDetail?.name ?? permissionId.toString()} from role ${roleDetail?.name ?? roleId.toString()}`,
      metadata: {
        roleId: roleId.toString(),
        roleName: roleDetail?.name ?? "unknown",
        permissionId: permissionId.toString(),
        permissionName: permissionDetail?.name ?? "unknown",
      },
      ...getAuditContext(req),
    });

    if (
      result.count === 0
    ) {
      return errorResponse(
        res,
        404,
        "Role permission assignment not found"
      );
    }

    return successResponse(
      res,
      200,
      "Permission removed from role successfully"
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid role or permission ID"
      );
    }

    console.error(
      "Remove permission error:",
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
| POST /users/:userId/roles/:roleId
|--------------------------------------------------------------------------
*/

export async function assignRole(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      parseId(
        req.params.userId
      );

    const roleId =
      parseId(
        req.params.roleId
      );

    const [
      user,
      role,
    ] =
      await Promise.all([
        userExists(userId),
        roleExists(roleId),
      ]);

    if (!user) {
      return errorResponse(
        res,
        404,
        "User not found"
      );
    }

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    const result =
      await assignRoleToUser(
        userId,
        roleId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "rbac.role_assigned",
      entityType: "user",
      entityId: userId.toString(),
      description: `Assigned role ${result.role.name} to ${result.user.email}`,
      metadata: {
        userId: userId.toString(),
        email: result.user.email,
        roleId: roleId.toString(),
        roleName: result.role.name,
      },
      ...getAuditContext(req),
    });

    return successResponse(
      res,
      200,
      "Role assigned to user successfully",
      result
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid user or role ID"
      );
    }

    if (
      isPrismaKnownError(
        error
      ) &&
      error.code === "P2003"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid user or role reference"
      );
    }

    console.error(
      "Assign role error:",
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
| DELETE /users/:userId/roles/:roleId
|--------------------------------------------------------------------------
*/

export async function removeRole(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      parseId(
        req.params.userId
      );

    const roleId =
      parseId(
        req.params.roleId
      );

    const [
      user,
      role,
    ] =
      await Promise.all([
        userExists(userId),
        roleExists(roleId),
      ]);

    if (!user) {
      return errorResponse(
        res,
        404,
        "User not found"
      );
    }

    if (!role) {
      return errorResponse(
        res,
        404,
        "Role not found"
      );
    }

    const adminRole =
      await getRoleByName(
        "admin"
      );

    if (
      adminRole &&
      adminRole.id === roleId
    ) {
      const assignment =
        await userHasRole(
          userId,
          roleId
        );

      if (!assignment) {
        return errorResponse(
          res,
          404,
          "User role assignment not found"
        );
      }

      const activeAdminCount =
        await countActiveUsersWithRole(
          adminRole.id
        );

      if (
        activeAdminCount <= 1
      ) {
        return errorResponse(
          res,
          409,
          "Cannot remove the admin role from the last active administrator"
        );
      }
    }

    const [
      targetUser,
      targetRole,
    ] = await Promise.all([
      getUserForAudit(userId),
      getRoleById(roleId),
    ]);

    const result =
      await removeRoleFromUser(
        userId,
        roleId
      );

    await writeAuditLog({
      ...(req.user?.userId && {
        actorUserId: BigInt(req.user.userId),
      }),
      action: "rbac.role_removed",
      entityType: "user",
      entityId: userId.toString(),
      description: `Removed role ${targetRole?.name ?? roleId.toString()} from ${targetUser?.email ?? userId.toString()}`,
      metadata: {
        userId: userId.toString(),
        email: targetUser?.email ?? "unknown",
        roleId: roleId.toString(),
        roleName: targetRole?.name ?? "unknown",
      },
      ...getAuditContext(req),
    });

    if (
      result.count === 0
    ) {
      return errorResponse(
        res,
        404,
        "User role assignment not found"
      );
    }

    return successResponse(
      res,
      200,
      "Role removed from user successfully"
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ID"
    ) {
      return errorResponse(
        res,
        400,
        "Invalid user or role ID"
      );
    }

    console.error(
      "Remove role error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Internal server error"
    );
  }
}