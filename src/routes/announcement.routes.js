import { Router } from "express";
import { destroy, index, published, show, store, update, } from "../controllers/announcement.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizeRoles, } from "../middleware/role.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
const router = Router();
router.use(authenticateToken);
// Employee
router.get("/published", authorizeRoles("employee", "admin", "hr"), published);
// Admin / HR
router.get("/", authorizePermission("announcements.view"), index);
router.post("/", authorizePermission("announcements.create"), store);
router.get("/:id", authorizePermission("announcements.view"), show);
router.put("/:id", authorizePermission("announcements.update"), update);
router.delete("/:id", authorizePermission("announcements.update"), destroy);
export default router;
//# sourceMappingURL=announcement.routes.js.map