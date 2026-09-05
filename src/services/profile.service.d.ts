export declare function getEmployeeProfile(employeeId: bigint): Promise<({
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
        id: bigint;
        employeeId: bigint | null;
        email: string;
        passwordHash: string;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
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
export declare function updateEmployeeProfile(employeeId: bigint, data: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
}): Promise<({
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
        id: bigint;
        employeeId: bigint | null;
        email: string;
        passwordHash: string;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
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
//# sourceMappingURL=profile.service.d.ts.map