export declare function getAllEmployees(): Promise<({
    company: {
        id: bigint;
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    department: {
        id: bigint;
        companyId: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    office: {
        id: bigint;
        companyId: bigint;
        name: string;
        address: string | null;
        latitude: import("@prisma/client-runtime-utils").Decimal | null;
        longitude: import("@prisma/client-runtime-utils").Decimal | null;
        allowedRadiusMeters: number;
        createdAt: Date;
        updatedAt: Date;
    };
    user: {
        createdAt: Date;
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    } | null;
} & {
    id: bigint;
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    position: string | null;
    workType: string | null;
    joinDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getEmployeeById(id: bigint): Promise<({
    company: {
        id: bigint;
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    department: {
        id: bigint;
        companyId: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    office: {
        id: bigint;
        companyId: bigint;
        name: string;
        address: string | null;
        latitude: import("@prisma/client-runtime-utils").Decimal | null;
        longitude: import("@prisma/client-runtime-utils").Decimal | null;
        allowedRadiusMeters: number;
        createdAt: Date;
        updatedAt: Date;
    };
    schedules: {
        id: bigint;
        employeeId: bigint;
        shiftId: bigint;
        officeId: bigint;
        workDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    user: {
        createdAt: Date;
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
        lastLoginAt: Date | null;
        roles: ({
            role: {
                id: bigint;
                name: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            userId: bigint;
            roleId: bigint;
        })[];
        updatedAt: Date;
    } | null;
} & {
    id: bigint;
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    position: string | null;
    workType: string | null;
    joinDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function createEmployee(data: {
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    position?: string;
    workType?: string;
    joinDate?: Date;
}): Promise<{
    id: bigint;
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    position: string | null;
    workType: string | null;
    joinDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateEmployee(id: bigint, data: {
    departmentId?: bigint;
    officeId?: bigint;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    position?: string;
    workType?: string;
    joinDate?: Date;
}): Promise<{
    id: bigint;
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    position: string | null;
    workType: string | null;
    joinDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateEmployeeStatus(id: bigint, status: string): Promise<{
    id: bigint;
    companyId: bigint;
    departmentId: bigint;
    officeId: bigint;
    employeeNumber: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    position: string | null;
    workType: string | null;
    joinDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=employee.service.d.ts.map