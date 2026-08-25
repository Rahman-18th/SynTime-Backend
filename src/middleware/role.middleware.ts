import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];

    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}