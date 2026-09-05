export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const userRoles = req.user?.roles ?? [];
        const hasPermission = userRoles.some((role) => allowedRoles.includes(role));
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map