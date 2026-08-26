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
  clockIn
);

router.patch(
  "/clock-out",
  clockOut
);

export default router;