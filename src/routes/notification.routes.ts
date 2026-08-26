import { Router } from "express";

import {
  markAsRead,
  myNotifications,
} from "../controllers/notification.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("employee")
);

router.get(
  "/my",
  myNotifications
);

router.patch(
  "/:id/read",
  markAsRead
);

export default router;