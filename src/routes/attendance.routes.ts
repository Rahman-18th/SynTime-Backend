import { Router } from "express";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

import {
  index,
  show,
  showBySchedule,
  getClockStatus,
  clockIn,
  clockOut,
  getMyAttendanceHistory,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(authenticateToken);

// =========================
// EMPLOYEE
// =========================

router.get(
  "/clock-status",
  authorizeRoles("employee"),
  getClockStatus
);

router.get(
  "/my",
  authorizeRoles("employee"),
  getMyAttendanceHistory
);

router.post(
  "/clock-in",
  authorizeRoles("employee"),
  clockIn
);

router.patch(
  "/clock-out",
  authorizeRoles("employee"),
  clockOut
);

// =========================
// ADMIN / HR
// =========================

router.get(
  "/",
  authorizeRoles("admin", "hr"),
  index
);

router.get(
  "/schedule/:scheduleId",
  authorizeRoles("admin", "hr"),
  showBySchedule
);

// WAJIB PALING BAWAH
router.get(
  "/:id",
  authorizeRoles("admin", "hr"),
  show
);

export default router;