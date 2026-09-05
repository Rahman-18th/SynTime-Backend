export declare function loginUser(email: string, password: string): Promise<{
    token: string;
    user: {
        id: string;
        employeeId: string | null;
        email: string;
        roles: string[];
        employee: {
            id: string;
            employeeNumber: string;
            firstName: string;
            lastName: string | null;
        } | null;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map