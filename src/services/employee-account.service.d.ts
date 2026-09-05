interface AccountResult {
    user: {
        id: string;
        employeeId: string;
        email: string;
        isActive: boolean;
    };
    temporaryPassword: string;
}
export declare function createEmployeeAccount(employeeId: bigint): Promise<AccountResult>;
export declare function resetEmployeePassword(employeeId: bigint): Promise<AccountResult>;
export declare function updateEmployeeAccountStatus(employeeId: bigint, isActive: boolean): Promise<{
    id: string;
    employeeId: string | null;
    email: string;
    isActive: boolean;
}>;
export {};
//# sourceMappingURL=employee-account.service.d.ts.map