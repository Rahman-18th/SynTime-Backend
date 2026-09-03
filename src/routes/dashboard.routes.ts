import {
  Router,
} from "express";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

import {
  myDashboard,
  adminDashboard,
} from "../controllers/dashboard.controller.js";

const router =
  Router();

router.use(
  authenticateToken
);

/*
|--------------------------------------------------------------------------
| Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authorizeRoles(
    "employee"
  ),
  myDashboard
);

/*
|--------------------------------------------------------------------------
| Admin / HR
|--------------------------------------------------------------------------
*/

router.get(
  "/admin",
  authorizeRoles(
    "admin",
    "hr"
  ),
  adminDashboard
);

export default router;