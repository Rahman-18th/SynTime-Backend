import {
  Router,
} from "express";

import {
  index,
  markAsRead,
  myNotifications,
  store,
} from "../controllers/notification.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

import {
  authorizePermission,
} from "../middleware/permission.middleware.js";

const router =
  Router();

router.use(
  authenticateToken
);

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  authorizeRoles(
    "employee"
  ),
  myNotifications
);

router.patch(
  "/:id/read",
  authorizeRoles(
    "employee"
  ),
  markAsRead
);

/*
|--------------------------------------------------------------------------
| Admin / HR Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authorizePermission("notifications.view"),
  index
);

router.post(
  "/",
  authorizePermission("notifications.create"),
  store
);

export default router;