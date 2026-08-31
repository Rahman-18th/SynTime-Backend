import { Router } from "express";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

import {
  myProfile,
  updateMyProfile,
} from "../controllers/profile.controller.js";

const router = Router();

router.get(
  "/me",
  authenticateToken,
  myProfile
);

router.patch(
  "/me",
  authenticateToken,
  updateMyProfile
);

export default router;