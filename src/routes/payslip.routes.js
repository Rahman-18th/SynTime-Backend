import { Router } from "express";
import { index, myPayslips, show, store, update, } from "../controllers/payslip.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizeRoles, } from "../middleware/role.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
const router = Router();
router.use(authenticateToken);
router.get("/my", authorizeRoles("employee"), myPayslips);
router.get("/", authorizePermission("payslips.view"), index);
router.post("/", authorizePermission("payslips.create"), store);
router.get("/:id", authorizePermission("payslips.view"), show);
router.put("/:id", authorizePermission("payslips.update"), update);
export default router;
//# sourceMappingURL=payslip.routes.js.map