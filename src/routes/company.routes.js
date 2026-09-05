import { Router, } from "express";
import { index, show, store, update, } from "../controllers/company.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
const router = Router();
router.use(authenticateToken);
router.get("/", authorizePermission("master_data.view"), index);
router.get("/:id", authorizePermission("master_data.view"), show);
router.post("/", authorizePermission("master_data.create"), store);
router.put("/:id", authorizePermission("master_data.update"), update);
export default router;
//# sourceMappingURL=company.routes.js.map