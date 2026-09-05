import { createRequest, getAllRequests, getRequestById, getRequestsByEmployee, reviewRequest, } from "../services/request.service.js";
import { isPrismaKnownError, } from "../utils/prisma-error.js";
import { createNotification, } from "../services/notification.service.js";
import { createRequestAttachment, getAttachmentsByRequest, } from "../services/request-attachment.service.js";
import { errorResponse, successResponse, } from "../utils/api-response.js";
function serializeBigInt(data) {
    return JSON.parse(JSON.stringify(data, (_, value) => typeof value === "bigint"
        ? value.toString()
        : value));
}
function parseId(id) {
    if (!id || Array.isArray(id)) {
        throw new Error("INVALID_ID");
    }
    try {
        return BigInt(id);
    }
    catch {
        throw new Error("INVALID_ID");
    }
}
export async function index(req, res) {
    try {
        const requests = await getAllRequests();
        return successResponse(res, 200, "Requests retrieved successfully", serializeBigInt(requests));
    }
    catch (error) {
        console.error("Get requests error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function show(req, res) {
    try {
        const id = parseId(req.params.id);
        const request = await getRequestById(id);
        if (!request) {
            return errorResponse(res, 404, "Request not found");
        }
        return successResponse(res, 200, "Request retrieved successfully", serializeBigInt(request));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid request ID");
        }
        console.error("Get request error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function myRequests(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        const requests = await getRequestsByEmployee(BigInt(employeeId));
        return successResponse(res, 200, "Employee requests retrieved successfully", serializeBigInt(requests));
    }
    catch (error) {
        console.error("Get employee requests error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function store(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        if (!req.body ||
            Object.keys(req.body).length === 0) {
            return errorResponse(res, 400, "Request body is required");
        }
        const { type, startDate, endDate, reason, } = req.body;
        if (!type ||
            !startDate ||
            !endDate ||
            !reason) {
            return errorResponse(res, 400, "type, startDate, endDate and reason are required");
        }
        const allowedTypes = [
            "leave",
            "permission",
            "attendance_correction",
        ];
        if (!allowedTypes.includes(type)) {
            return errorResponse(res, 400, "Invalid request type");
        }
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (Number.isNaN(parsedStartDate.getTime()) ||
            Number.isNaN(parsedEndDate.getTime())) {
            return errorResponse(res, 400, "Invalid request date");
        }
        if (parsedEndDate.getTime() <
            parsedStartDate.getTime()) {
            return errorResponse(res, 400, "endDate cannot be earlier than startDate");
        }
        const request = await createRequest({
            employeeId: BigInt(employeeId),
            type,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            reason,
        });
        return successResponse(res, 201, "Request submitted successfully", serializeBigInt(request));
    }
    catch (error) {
        if (isPrismaKnownError(error)) {
            if (error.code === "P2003") {
                return errorResponse(res, 400, "Invalid employee reference");
            }
        }
        console.error("Create request error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function review(req, res) {
    try {
        const id = parseId(req.params.id);
        const reviewerId = req.user?.userId;
        if (!reviewerId) {
            return errorResponse(res, 401, "Unauthorized");
        }
        if (!req.body ||
            Object.keys(req.body).length === 0) {
            return errorResponse(res, 400, "Request body is required");
        }
        const { status, reviewNote, } = req.body;
        const allowedStatuses = [
            "approved",
            "rejected",
        ];
        if (!status ||
            !allowedStatuses.includes(status)) {
            return errorResponse(res, 400, "Status must be approved or rejected");
        }
        const existingRequest = await getRequestById(id);
        if (!existingRequest) {
            return errorResponse(res, 404, "Request not found");
        }
        if (existingRequest.status !==
            "pending") {
            return errorResponse(res, 409, "Request has already been reviewed");
        }
        const updatedRequest = await reviewRequest(id, {
            reviewedBy: BigInt(reviewerId),
            status,
            reviewedAt: new Date(),
            ...(reviewNote !== undefined && {
                reviewNote,
            }),
        });
        const notificationTitle = status === "approved"
            ? "Request Approved"
            : "Request Rejected";
        const notificationMessage = status === "approved"
            ? `Your ${existingRequest.type} request has been approved.`
            : `Your ${existingRequest.type} request has been rejected.`;
        await createNotification({
            employeeId: existingRequest.employeeId,
            title: notificationTitle,
            message: notificationMessage,
            type: "request_review",
        });
        return successResponse(res, 200, `Request ${status} successfully`, serializeBigInt(updatedRequest));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid request ID");
        }
        if (isPrismaKnownError(error)) {
            if (error.code === "P2025") {
                return errorResponse(res, 404, "Request not found");
            }
        }
        console.error("Review request error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function addAttachment(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        const requestId = parseId(req.params.id);
        const request = await getRequestById(requestId);
        if (!request) {
            return errorResponse(res, 404, "Request not found");
        }
        if (request.employeeId !==
            BigInt(employeeId)) {
            return errorResponse(res, 403, "You cannot add attachments to this request");
        }
        if (!req.file) {
            return errorResponse(res, 400, "Attachment file is required");
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        const attachment = await createRequestAttachment({
            requestId,
            fileName: req.file.originalname,
            fileUrl,
            fileType: req.file.mimetype,
            fileSize: BigInt(req.file.size),
        });
        return successResponse(res, 201, "Attachment uploaded successfully", serializeBigInt(attachment));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid request ID");
        }
        console.error("Upload attachment error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function attachments(req, res) {
    try {
        const id = parseId(req.params.id);
        const request = await getRequestById(id);
        if (!request) {
            return errorResponse(res, 404, "Request not found");
        }
        const roles = req.user?.roles ?? [];
        const employeeId = req.user?.employeeId;
        const isAdminOrHr = roles.includes("admin") ||
            roles.includes("hr");
        const isOwner = employeeId !== null &&
            employeeId !== undefined &&
            request.employeeId ===
                BigInt(employeeId);
        if (!isAdminOrHr &&
            !isOwner) {
            return errorResponse(res, 403, "You do not have permission to view these attachments");
        }
        const data = await getAttachmentsByRequest(id);
        return successResponse(res, 200, "Request attachments retrieved successfully", serializeBigInt(data));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid request ID");
        }
        console.error("Get request attachments error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
//# sourceMappingURL=request.controller.js.map