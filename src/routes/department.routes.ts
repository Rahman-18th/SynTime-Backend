import {
  Router,
} from "express";

import {
  index,
  show,
  store,
  update,
} from "../controllers/department.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

const router =
  Router();

router.use(
  authenticateToken
);

router.get(
  "/",
  authorizeRoles(
    "admin",
    "hr"
  ),
  index
);

router.get(
  "/:id",
  authorizeRoles(
    "admin",
    "hr"
  ),
  show
);

router.post(
  "/",
  authorizeRoles(
    "admin"
  ),
  store
);

router.put(
  "/:id",
  authorizeRoles(
    "admin"
  ),
  update
);

export default router;