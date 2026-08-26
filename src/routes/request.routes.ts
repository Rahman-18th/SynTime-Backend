import { Router } from "express";

import {
  addAttachment,
  attachments,
  index,
  myRequests,
  review,
  show,
  store,
} from "../controllers/request.controller.js";

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
  myRequests
);

router.post(
  "/",
  authorizeRoles("employee"),
  store
);

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

router.patch(
  "/:id/review",
  authorizeRoles("admin", "hr"),
  review
);

router.post(
  "/:id/attachments",
  authorizeRoles("employee"),
  addAttachment
);

router.get(
  "/:id/attachments",
  attachments
);

export default router;