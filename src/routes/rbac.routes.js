import { Router, } from "express";
import { assignPermission, assignRole, permissionsIndex, removePermission, removeRole, rolesIndex, roleShow, usersIndex, } from "../controllers/rbac.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
const router = Router();
/*
|--------------------------------------------------------------------------
| RBAC Protection
|--------------------------------------------------------------------------
*/
router.use(authenticateToken);
/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/
router.get("/roles", authorizePermission("rbac.view"), rolesIndex);
router.get("/roles/:id", authorizePermission("rbac.view"), roleShow);
/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/
router.get("/permissions", authorizePermission("rbac.view"), permissionsIndex);
/*
|--------------------------------------------------------------------------
| Role Permissions
|--------------------------------------------------------------------------
*/
router.post("/roles/:roleId/permissions/:permissionId", authorizePermission("rbac.manage"), assignPermission);
router.delete("/roles/:roleId/permissions/:permissionId", authorizePermission("rbac.manage"), removePermission);
/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/
router.get("/users", authorizePermission("rbac.view"), usersIndex);
/*
|--------------------------------------------------------------------------
| User Roles
|--------------------------------------------------------------------------
*/
router.post("/users/:userId/roles/:roleId", authorizePermission("rbac.manage"), assignRole);
router.delete("/users/:userId/roles/:roleId", authorizePermission("rbac.manage"), removeRole);
export default router;
//# sourceMappingURL=rbac.routes.js.map