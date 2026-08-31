import { Router } from "express";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  myDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get(
  "/me",
  authenticateToken,
  myDashboard
);

export default router;