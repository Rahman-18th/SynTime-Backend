import prisma from "../config/prisma.js";
export function authorizePermission(...requiredPermissions) {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication is required",
                });
            }
            let parsedUserId;
            try {
                parsedUserId = BigInt(userId);
            }
            catch {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user",
                });
            }
            const user = await prisma.user.findUnique({
                where: {
                    id: parsedUserId,
                },
                select: {
                    isActive: true,
                    roles: {
                        select: {
                            role: {
                                select: {
                                    permissions: {
                                        select: {
                                            permission: {
                                                select: {
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User account not found",
                });
            }
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: "User account is inactive",
                });
            }
            const userPermissions = new Set(user.roles.flatMap((userRole) => userRole.role.permissions.map((rolePermission) => rolePermission.permission.name)));
            const hasPermission = requiredPermissions.some((permission) => userPermissions.has(permission));
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource",
                });
            }
            next();
        }
        catch (error) {
            console.error("Permission authorization error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
}
//# sourceMappingURL=permission.middleware.js.map