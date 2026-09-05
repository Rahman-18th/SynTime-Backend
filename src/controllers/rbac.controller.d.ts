import type { Request, Response } from "express";
export declare function rolesIndex(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function roleShow(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function permissionsIndex(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function usersIndex(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function assignPermission(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removePermission(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function assignRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removeRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=rbac.controller.d.ts.map