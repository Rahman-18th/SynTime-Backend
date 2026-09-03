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
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| Authentication + Authorization
|--------------------------------------------------------------------------
*/

router.use(
  authenticateToken,
  authorizeRoles(
    "admin",
    "hr"
  )
);

/*
|--------------------------------------------------------------------------
| Employee Account
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/account",
  createAccount
);

router.post(
  "/:id/account/reset-password",
  resetPassword
);

router.patch(
  "/:id/account/status",
  updateAccountStatus
);

/*
|--------------------------------------------------------------------------
| Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  index
);

router.get(
  "/:id",
  show
);

router.post(
  "/",
  store
);

router.put(
  "/:id",
  update
);

router.patch(
  "/:id/status",
  updateStatus
);

export default router;