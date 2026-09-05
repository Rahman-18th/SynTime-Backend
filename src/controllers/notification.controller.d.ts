import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function store(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function myNotifications(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function markAsRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notification.controller.d.ts.map