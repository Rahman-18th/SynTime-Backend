import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare function index(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function show(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function myRequests(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function store(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function review(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addAttachment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function attachments(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=request.controller.d.ts.map