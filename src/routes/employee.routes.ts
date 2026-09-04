import {
  Router,
} from "express";

import {
  index,
  show,
  store,
  update,
  updateStatus,
} from "../controllers/employee.controller.js";

import {
  createAccount,
  resetPassword,
  updateAccountStatus,
} from "../controllers/employee-account.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizePermission,
} from "../middleware/permission.middleware.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| Authentication + Authorization
|--------------------------------------------------------------------------
*/

router.use(
  authenticateToken
);

/*
|--------------------------------------------------------------------------
| Employee Account
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/account",
  authorizePermission("employees.manage_account"),
  createAccount
);

router.post(
  "/:id/account/reset-password",
  authorizePermission("employees.manage_account"),
  resetPassword
);

router.patch(
  "/:id/account/status",
  authorizePermission("employees.manage_account"),
  updateAccountStatus
);

/*
|--------------------------------------------------------------------------
| Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authorizePermission("employees.view"),
  index
);

router.get(
  "/:id",
  authorizePermission("employees.view"),
  show
);

router.post(
  "/",
  authorizePermission("employees.create"),
  store
);

router.put(
  "/:id",
  authorizePermission("employees.update"),
  update
);

router.patch(
  "/:id/status",
  authorizePermission("employees.update"),
  updateStatus
);

export default router;