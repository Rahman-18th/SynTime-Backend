import type { Response } from "express";
export declare function successResponse(res: Response, statusCode: number, message: string, data?: unknown): Response<any, Record<string, any>>;
export declare function errorResponse(res: Response, statusCode: number, message: string, errors?: unknown): Response<any, Record<string, any>>;
//# sourceMappingURL=api-response.d.ts.map