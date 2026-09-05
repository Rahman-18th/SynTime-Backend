import { getAdminDashboard, getEmployeeDashboard, } from "../services/dashboard.service.js";
import { errorResponse, successResponse, } from "../utils/api-response.js";
/*
|--------------------------------------------------------------------------
| Employee Dashboard
|--------------------------------------------------------------------------
*/
export async function myDashboard(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        const dashboard = await getEmployeeDashboard(BigInt(employeeId));
        if (!dashboard) {
            return errorResponse(res, 404, "Employee not found");
        }
        return successResponse(res, 200, "Dashboard retrieved successfully", dashboard);
    }
    catch (error) {
        console.error("Get employee dashboard error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/
export async function adminDashboard(req, res) {
    try {
        const dashboard = await getAdminDashboard();
        return successResponse(res, 200, "Admin dashboard retrieved successfully", dashboard);
    }
    catch (error) {
        console.error("Get admin dashboard error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
//# sourceMappingURL=dashboard.controller.js.map