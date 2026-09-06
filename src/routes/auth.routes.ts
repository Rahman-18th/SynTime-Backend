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

export default router;