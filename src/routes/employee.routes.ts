import { Router } from "express";

import {
  index,
  show,
  store,
  update,
  updateStatus,
} from "../controllers/employee.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(
  authenticateToken,
  authorizeRoles("admin", "hr")
);

router.get("/", index);
router.get("/:id", show);
router.post("/", store);
router.put("/:id", update);
router.patch("/:id/status", updateStatus);

export default router;