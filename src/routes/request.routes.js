import { Router } from "express";
import { addAttachment, attachments, index, myRequests, review, show, store, } from "../controllers/request.controller.js";
import { authenticateToken, } from "../middleware/auth.middleware.js";
import { authorizeRoles, } from "../middleware/role.middleware.js";
import { authorizePermission, } from "../middleware/permission.middleware.js";
import { uploadRequestAttachment, } from "../middleware/upload.middleware.js";
const router = Router();
router.use(authenticateToken);
router.get("/my", authorizeRoles("employee"), myRequests);
router.post("/", authorizeRoles("employee"), store);
router.get("/", authorizePermission("requests.view"), index);
router.get("/:id", authorizePermission("requests.view"), show);
router.patch("/:id/review", authorizePermission("requests.review"), review);
router.post("/:id/attachments", authorizeRoles("employee"), uploadRequestAttachment.single("file"), addAttachment);
router.get("/:id/attachments", attachments);
export default router;
//# sourceMappingURL=request.routes.js.map