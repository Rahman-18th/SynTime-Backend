import { Router, } from "express";
import { index, update, } from "../controllers/setting.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
const router = Router();
router.use(authenticateToken);
router.get("/", authorizePermission("settings.view"), index);
router.put("/", authorizePermission("settings.update"), update);
export default router;
//# sourceMappingURL=setting.routes.js.map