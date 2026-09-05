import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAnnouncementById, getPublishedAnnouncements, updateAnnouncement, } from "../services/announcement.service.js";
import { errorResponse, successResponse, } from "../utils/api-response.js";
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
const allowedPriorities = [
    "normal",
    "important",
    "urgent",
];
export async function published(req, res) {
    try {
        const announcements = await getPublishedAnnouncements();
        return successResponse(res, 200, "Announcements retrieved successfully", announcements);
    }
    catch (error) {
        console.error("GET PUBLISHED ANNOUNCEMENTS ERROR:", error);
        return errorResponse(res, 500, "Failed to retrieve announcements");
    }
}
export async function index(req, res) {
    try {
        const announcements = await getAllAnnouncements();
        return successResponse(res, 200, "Announcements retrieved successfully", announcements);
    }
    catch (error) {
        console.error("GET ANNOUNCEMENTS ERROR:", error);
        return errorResponse(res, 500, "Failed to retrieve announcements");
    }
}
export async function show(req, res) {
    try {
        const id = parseId(req.params.id);
        const announcement = await getAnnouncementById(id);
        if (!announcement) {
            return errorResponse(res, 404, "Announcement not found");
        }
        return successResponse(res, 200, "Announcement retrieved successfully", announcement);
    }
    catch (error) {
        console.error("GET ANNOUNCEMENT ERROR:", error);
        return errorResponse(res, 400, "Invalid announcement ID");
    }
}
export async function store(req, res) {
    try {
        const { title, message, priority, isPublished, } = req.body;
        if (!title ||
            !title.toString().trim()) {
            return errorResponse(res, 400, "Title is required");
        }
        if (!message ||
            !message.toString().trim()) {
            return errorResponse(res, 400, "Message is required");
        }
        const selectedPriority = priority ?? "normal";
        if (!allowedPriorities.includes(selectedPriority)) {
            return errorResponse(res, 400, "Priority must be normal, important, or urgent");
        }
        const announcement = await createAnnouncement({
            title: title.toString().trim(),
            message: message.toString().trim(),
            priority: selectedPriority,
            isPublished: isPublished ?? false,
        });
        return successResponse(res, 201, "Announcement created successfully", announcement);
    }
    catch (error) {
        console.error("CREATE ANNOUNCEMENT ERROR:", error);
        return errorResponse(res, 500, "Failed to create announcement");
    }
}
export async function update(req, res) {
    try {
        const id = parseId(req.params.id);
        const existing = await getAnnouncementById(id);
        if (!existing) {
            return errorResponse(res, 404, "Announcement not found");
        }
        const { title, message, priority, isPublished, } = req.body;
        if (priority !== undefined &&
            !allowedPriorities.includes(priority)) {
            return errorResponse(res, 400, "Priority must be normal, important, or urgent");
        }
        const announcement = await updateAnnouncement(id, {
            ...(title !== undefined && {
                title: title.toString().trim(),
            }),
            ...(message !== undefined && {
                message: message.toString().trim(),
            }),
            ...(priority !== undefined && {
                priority,
            }),
            ...(isPublished !== undefined && {
                isPublished,
            }),
        });
        return successResponse(res, 200, "Announcement updated successfully", announcement);
    }
    catch (error) {
        console.error("UPDATE ANNOUNCEMENT ERROR:", error);
        return errorResponse(res, 500, "Failed to update announcement");
    }
}
export async function destroy(req, res) {
    try {
        const id = parseId(req.params.id);
        const existing = await getAnnouncementById(id);
        if (!existing) {
            return errorResponse(res, 404, "Announcement not found");
        }
        await deleteAnnouncement(id);
        return successResponse(res, 200, "Announcement deleted successfully");
    }
    catch (error) {
        console.error("DELETE ANNOUNCEMENT ERROR:", error);
        return errorResponse(res, 500, "Failed to delete announcement");
    }
}
//# sourceMappingURL=announcement.controller.js.map