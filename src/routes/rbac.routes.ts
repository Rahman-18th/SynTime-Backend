import {
  Router,
} from "express";

import {
  assignPermission,
  assignRole,
  permissionsIndex,
  removePermission,
  removeRole,
  rolesIndex,
  roleShow,
  usersIndex,
} from "../controllers/rbac.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| RBAC Protection
|--------------------------------------------------------------------------
*/

router.use(
  authenticateToken,
  authorizeRoles("admin")
);

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

router.get(
  "/roles",
  rolesIndex
);

router.get(
  "/roles/:id",
  roleShow
);

/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

router.get(
  "/permissions",
  permissionsIndex
);

/*
|--------------------------------------------------------------------------
| Role Permissions
|--------------------------------------------------------------------------
*/

router.post(
  "/roles/:roleId/permissions/:permissionId",
  assignPermission
);

router.delete(
  "/roles/:roleId/permissions/:permissionId",
  removePermission
);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  usersIndex
);

/*
|--------------------------------------------------------------------------
| User Roles
|--------------------------------------------------------------------------
*/

router.post(
  "/users/:userId/roles/:roleId",
  assignRole
);

router.delete(
  "/users/:userId/roles/:roleId",
  removeRole
);

export default router;