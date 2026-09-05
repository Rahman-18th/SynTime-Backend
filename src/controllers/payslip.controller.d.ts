import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function myPayslips(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function store(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payslip.controller.d.ts.map