import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function myDashboard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function adminDashboard(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=dashboard.controller.d.ts.map