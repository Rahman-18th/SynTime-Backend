import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function myProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateMyProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=profile.controller.d.ts.map