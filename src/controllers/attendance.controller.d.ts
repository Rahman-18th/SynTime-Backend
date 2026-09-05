import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function showBySchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getClockStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function clockIn(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function clockOut(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMyAttendanceHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=attendance.controller.d.ts.map