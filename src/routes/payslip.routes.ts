import { Router } from "express";

import {
  index,
  myPayslips,
  show,
  store,
  update,
} from "../controllers/payslip.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get(
  "/my",
  authorizeRoles("employee"),
  myPayslips
);

router.get(
  "/",
  authorizeRoles("admin", "hr"),
  index
);

router.post(
  "/",
  authorizeRoles("admin", "hr"),
  store
);

router.get(
  "/:id",
  authorizeRoles("admin", "hr"),
  show
);

router.put(
  "/:id",
  authorizeRoles("admin", "hr"),
  update
);

export default router;