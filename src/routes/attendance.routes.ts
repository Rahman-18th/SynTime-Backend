import { Router } from "express";

import {
  clockIn,
  clockOut,
  index,
  show,
} from "../controllers/attendance.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get(
  "/",
  authorizeRoles("admin", "hr"),
  index
);

router.get(
  "/:id",
  authorizeRoles("admin", "hr"),
  show
);

router.post(
  "/clock-in",
  authorizeRoles("admin", "hr"),
  clockIn
);

router.patch(
  "/:id/clock-out",
  authorizeRoles("admin", "hr"),
  clockOut
);

export default router;