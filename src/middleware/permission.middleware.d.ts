import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
export declare function authorizePermission(...requiredPermissions: string[]): (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=permission.middleware.d.ts.map