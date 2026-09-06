import {
  Router,
} from "express";

import {
  login,
} from "../controllers/auth.controller.js";

import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

import {
  loginRateLimiter,
} from "../middleware/rate-limit.middleware.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginRateLimiter,
  login
);

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authenticateToken,
  (
    req: AuthRequest,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Token is valid",

        data: {
          user:
            req.user,
        },
      });
  }
);

/*
|--------------------------------------------------------------------------
| Development/Test endpoint
|--------------------------------------------------------------------------
*/

router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles(
    "admin"
  ),
  (
    req: AuthRequest,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Admin access granted",
      });
  }
);

export default router;