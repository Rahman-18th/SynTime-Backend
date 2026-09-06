import type {
  NextFunction,
  Response,
} from "express";

import type {
  AuthRequest,
} from "./auth.middleware.js";

export function authorizeRoles(
  ...allowedRoles: string[]
) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Authentication is required",
        });
    }

    const userRoles =
      req.user.roles;

    const hasRole =
      userRoles.some(
        (role) =>
          allowedRoles.includes(
            role
          )
      );

    if (!hasRole) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "You do not have permission to access this resource",
        });
    }

    next();
  };
}