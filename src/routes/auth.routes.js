import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
const router = Router();
router.post("/login", login);
router.get("/me", authenticateToken, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
            user: req.user,
        },
    });
});
router.get("/admin-test", authenticateToken, authorizeRoles("admin"), (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Admin access granted",
    });
});
export default router;
//# sourceMappingURL=auth.routes.js.map