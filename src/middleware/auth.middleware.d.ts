import type { NextFunction, Request, Response } from "express";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        employeeId: string | null;
        roles: string[];
    };
}
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map