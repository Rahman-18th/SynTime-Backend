export declare function getAllRoles(): Promise<({
    _count: {
        permissions: number;
        users: number;
    };
    permissions: ({
        permission: {
            id: bigint;
            name: string;
            description: string | null;
            createdAt: Date;
        };
    } & {
        roleId: bigint;
        permissionId: bigint;
    })[];
} & {
    id: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
})[]>;
export declare function getRoleById(id: bigint): Promise<({
    permissions: ({
        permission: {
            id: bigint;
            name: string;
            description: string | null;
            createdAt: Date;
        };
    } & {
        roleId: bigint;
        permissionId: bigint;
    })[];
    users: ({
        user: {
            email: string;
            employeeId: bigint | null;
            id: bigint;
            isActive: boolean;
        };
    } & {
        userId: bigint;
        roleId: bigint;
    })[];
} & {
    id: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
}) | null>;
export declare function getAllPermissions(): Promise<({
    _count: {
        roles: number;
    };
} & {
    id: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
})[]>;
export declare function getAllUsersWithRoles(): Promise<{
    createdAt: Date;
    email: string;
    employee: {
        employeeNumber: string;
        firstName: string;
        id: bigint;
        lastName: string | null;
        position: string | null;
        status: string;
    } | null;
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
}[]>;
export declare function assignPermissionToRole(roleId: bigint, permissionId: bigint): Promise<{
    permission: {
        id: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
    };
    role: {
        id: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
    };
} & {
    roleId: bigint;
    permissionId: bigint;
}>;
export declare function removePermissionFromRole(roleId: bigint, permissionId: bigint): Promise<import("../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
export declare function assignRoleToUser(userId: bigint, roleId: bigint): Promise<{
    role: {
        id: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
    };
    user: {
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
    };
} & {
    userId: bigint;
    roleId: bigint;
}>;
export declare function removeRoleFromUser(userId: bigint, roleId: bigint): Promise<import("../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
export declare function roleExists(id: bigint): Promise<{
    id: bigint;
} | null>;
export declare function permissionExists(id: bigint): Promise<{
    id: bigint;
} | null>;
export declare function userExists(id: bigint): Promise<{
    id: bigint;
} | null>;
export declare function getRoleByName(name: string): Promise<{
    id: bigint;
    name: string;
} | null>;
export declare function getPermissionByName(name: string): Promise<{
    id: bigint;
    name: string;
} | null>;
export declare function countActiveUsersWithRole(roleId: bigint): Promise<number>;
export declare function userHasRole(userId: bigint, roleId: bigint): Promise<{
    roleId: bigint;
    userId: bigint;
} | null>;
//# sourceMappingURL=rbac.service.d.ts.map