import {
  Router,
} from "express";

import {
  index,
} from "../controllers/audit-log.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizePermission,
} from "../middleware/permission.middleware.js";

const router =
  Router();

router.use(
  authenticateToken
);

router.get(
  "/",
  authorizePermission(
    "audit_logs.view"
  ),
  index
);

export default router;