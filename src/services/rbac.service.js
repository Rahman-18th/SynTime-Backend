import prisma from "../config/prisma.js";
/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/
export async function getAllRoles() {
    return prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            _count: {
                select: {
                    users: true,
                    permissions: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}
export async function getRoleById(id) {
    return prisma.role.findUnique({
        where: {
            id,
        },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            users: {
                include: {
                    user: {
                        select: {
                            id: true,
                            employeeId: true,
                            email: true,
                            isActive: true,
                        },
                    },
                },
            },
        },
    });
}
/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/
export async function getAllPermissions() {
    return prisma.permission.findMany({
        include: {
            _count: {
                select: {
                    roles: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}
/*
|--------------------------------------------------------------------------
| Users + Roles
|--------------------------------------------------------------------------
*/
export async function getAllUsersWithRoles() {
    return prisma.user.findMany({
        select: {
            id: true,
            employeeId: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            employee: {
                select: {
                    id: true,
                    employeeNumber: true,
                    firstName: true,
                    lastName: true,
                    position: true,
                    status: true,
                },
            },
            roles: {
                include: {
                    role: true,
                },
            },
        },
        orderBy: {
            email: "asc",
        },
    });
}
/*
|--------------------------------------------------------------------------
| Role Permission Assignment
|--------------------------------------------------------------------------
*/
export async function assignPermissionToRole(roleId, permissionId) {
    return prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId,
            },
        },
        update: {},
        create: {
            roleId,
            permissionId,
        },
        include: {
            role: true,
            permission: true,
        },
    });
}
export async function removePermissionFromRole(roleId, permissionId) {
    return prisma.rolePermission.deleteMany({
        where: {
            roleId,
            permissionId,
        },
    });
}
/*
|--------------------------------------------------------------------------
| User Role Assignment
|--------------------------------------------------------------------------
*/
export async function assignRoleToUser(userId, roleId) {
    return prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId,
                roleId,
            },
        },
        update: {},
        create: {
            userId,
            roleId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    employeeId: true,
                    email: true,
                    isActive: true,
                },
            },
            role: true,
        },
    });
}
export async function removeRoleFromUser(userId, roleId) {
    return prisma.userRole.deleteMany({
        where: {
            userId,
            roleId,
        },
    });
}
/*
|--------------------------------------------------------------------------
| Existence Checks
|--------------------------------------------------------------------------
*/
export async function roleExists(id) {
    return prisma.role.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });
}
export async function permissionExists(id) {
    return prisma.permission.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });
}
export async function userExists(id) {
    return prisma.user.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });
}
export async function getRoleByName(name) {
    return prisma.role.findUnique({
        where: {
            name,
        },
        select: {
            id: true,
            name: true,
        },
    });
}
export async function getPermissionByName(name) {
    return prisma.permission.findUnique({
        where: {
            name,
        },
        select: {
            id: true,
            name: true,
        },
    });
}
export async function countActiveUsersWithRole(roleId) {
    return prisma.user.count({
        where: {
            isActive: true,
            roles: {
                some: {
                    roleId,
                },
            },
        },
    });
}
export async function userHasRole(userId, roleId) {
    return prisma.userRole.findUnique({
        where: {
            userId_roleId: {
                userId,
                roleId,
            },
        },
        select: {
            userId: true,
            roleId: true,
        },
    });
}
//# sourceMappingURL=rbac.service.js.map