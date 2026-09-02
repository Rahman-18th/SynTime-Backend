import { Router } from "express";

import {
  destroy,
  index,
  published,
  show,
  store,
  update,
} from "../controllers/announcement.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

// Employee
router.get(
  "/published",
  authorizeRoles(
    "employee",
    "admin",
    "hr",
  ),
  published,
);

// Admin / HR
router.get(
  "/",
  authorizeRoles(
    "admin",
    "hr",
  ),
  index,
);

router.post(
  "/",
  authorizeRoles(
    "admin",
    "hr",
  ),
  store,
);

router.get(
  "/:id",
  authorizeRoles(
    "admin",
    "hr",
  ),
  show,
);

router.put(
  "/:id",
  authorizeRoles(
    "admin",
    "hr",
  ),
  update,
);

router.delete(
  "/:id",
  authorizeRoles(
    "admin",
    "hr",
  ),
  destroy,
);

export default router;