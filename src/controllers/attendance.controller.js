import { calculateDistanceMeters, } from "../utils/distance.js";
import { determineAttendanceStatus, isScheduleToday, getTodayWorkDate, } from "../utils/attendance-time.js";
import { clockInAttendance, clockOutAttendance, getAllAttendances, getAttendanceById, getAttendanceBySchedule, getMyAttendances, getScheduleForAttendance, getTodayScheduleByEmployee, } from "../services/attendance.service.js";
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
        const attendances = await getAllAttendances();
        return successResponse(res, 200, "Attendances retrieved successfully", serializeBigInt(attendances));
    }
    catch (error) {
        console.error("Get attendances error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function show(req, res) {
    try {
        const id = parseId(req.params.id);
        const attendance = await getAttendanceById(id);
        if (!attendance) {
            return errorResponse(res, 404, "Attendance not found");
        }
        return successResponse(res, 200, "Attendance retrieved successfully", serializeBigInt(attendance));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid attendance ID");
        }
        console.error("Get attendance error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function showBySchedule(req, res) {
    try {
        const scheduleId = parseId(req.params.scheduleId);
        const attendance = await getAttendanceBySchedule(scheduleId);
        if (!attendance) {
            return errorResponse(res, 404, "Attendance not found for this schedule");
        }
        return successResponse(res, 200, "Attendance retrieved successfully", serializeBigInt(attendance));
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid schedule ID");
        }
        console.error("Get attendance by schedule error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function getClockStatus(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        const today = getTodayWorkDate();
        const schedule = await getTodayScheduleByEmployee(BigInt(employeeId), today);
        if (!schedule) {
            return errorResponse(res, 404, "No schedule found for today");
        }
        const attendance = schedule.attendance;
        const hasCheckedIn = attendance?.checkInAt != null;
        const hasCheckedOut = attendance?.checkOutAt != null;
        let attendanceStatus = "Ready to Clock In";
        if (hasCheckedIn &&
            !hasCheckedOut) {
            attendanceStatus =
                "Ready to Clock Out";
        }
        if (hasCheckedOut) {
            attendanceStatus =
                "Attendance Completed";
        }
        function formatTime(value) {
            if (!value) {
                return "--:--";
            }
            const offsetMinutes = Number(process.env
                .TIMEZONE_OFFSET_MINUTES ??
                420);
            const local = new Date(value.getTime() +
                offsetMinutes *
                    60 *
                    1000);
            const hours = local
                .getUTCHours()
                .toString()
                .padStart(2, "0");
            const minutes = local
                .getUTCMinutes()
                .toString()
                .padStart(2, "0");
            return `${hours}:${minutes}`;
        }
        function calculateTotalHours() {
            if (!attendance?.checkInAt) {
                return "--";
            }
            const end = attendance.checkOutAt ??
                new Date();
            const totalMinutes = Math.max(0, Math.floor((end.getTime() -
                attendance
                    .checkInAt
                    .getTime()) /
                (1000 * 60)));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h ${minutes
                .toString()
                .padStart(2, "0")}m`;
        }
        return successResponse(res, 200, "Clock status retrieved successfully", {
            employeeName: [
                schedule.employee.firstName,
                schedule.employee.lastName,
            ]
                .filter(Boolean)
                .join(" "),
            attendanceStatus,
            shiftName: schedule.shift.name,
            shiftTime: `${formatTime(schedule.shift.startTime)} - ${formatTime(schedule.shift.endTime)}`,
            checkInTime: formatTime(attendance?.checkInAt),
            checkOutTime: formatTime(attendance?.checkOutAt),
            totalHours: calculateTotalHours(),
            office: {
                name: schedule.office.name,
                address: schedule.office.address ??
                    "",
                latitude: schedule.office.latitude !==
                    null
                    ? Number(schedule.office
                        .latitude)
                    : null,
                longitude: schedule.office.longitude !==
                    null
                    ? Number(schedule.office
                        .longitude)
                    : null,
                allowedRadiusMeters: schedule.office
                    .allowedRadiusMeters,
            },
            hasCheckedIn,
            hasCheckedOut,
            attendanceRecordStatus: attendance?.status ?? null,
        });
    }
    catch (error) {
        console.error("Get clock status error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function clockIn(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        if (!req.body ||
            Object.keys(req.body).length === 0) {
            return errorResponse(res, 400, "Request body is required");
        }
        const { latitude, longitude, } = req.body;
        if (latitude === undefined ||
            longitude === undefined) {
            return errorResponse(res, 400, "latitude and longitude are required");
        }
        const parsedEmployeeId = BigInt(employeeId);
        const today = getTodayWorkDate();
        const schedule = await getTodayScheduleByEmployee(parsedEmployeeId, today);
        if (!schedule) {
            return errorResponse(res, 404, "No schedule found for today");
        }
        if (schedule.status !== "scheduled") {
            return errorResponse(res, 400, "Attendance cannot be created for this schedule");
        }
        if (schedule.attendance) {
            return errorResponse(res, 409, "Employee has already clocked in today");
        }
        if (schedule.office.latitude === null ||
            schedule.office.longitude === null) {
            return errorResponse(res, 400, "Office location is not configured");
        }
        const employeeLatitude = Number(latitude);
        const employeeLongitude = Number(longitude);
        if (Number.isNaN(employeeLatitude) ||
            Number.isNaN(employeeLongitude)) {
            return errorResponse(res, 400, "Latitude and longitude must be valid numbers");
        }
        if (employeeLatitude < -90 ||
            employeeLatitude > 90 ||
            employeeLongitude < -180 ||
            employeeLongitude > 180) {
            return errorResponse(res, 400, "Latitude or longitude is out of range");
        }
        const officeLatitude = Number(schedule.office.latitude);
        const officeLongitude = Number(schedule.office.longitude);
        const distanceMeters = calculateDistanceMeters(employeeLatitude, employeeLongitude, officeLatitude, officeLongitude);
        const allowedRadius = schedule.office.allowedRadiusMeters;
        if (distanceMeters >
            allowedRadius) {
            return errorResponse(res, 403, "You are outside the allowed office radius", {
                distanceMeters: Math.round(distanceMeters * 100) / 100,
                allowedRadiusMeters: allowedRadius,
            });
        }
        const now = new Date();
        const attendanceStatus = determineAttendanceStatus(now, schedule.workDate, schedule.shift.startTime);
        const attendance = await clockInAttendance({
            scheduleId: schedule.id,
            checkInAt: now,
            status: attendanceStatus,
            checkInLatitude: employeeLatitude,
            checkInLongitude: employeeLongitude,
            checkInDistanceMeters: distanceMeters,
        });
        return successResponse(res, 201, "Clock in successful", serializeBigInt(attendance));
    }
    catch (error) {
        console.error("Clock in error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function clockOut(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        if (!req.body ||
            Object.keys(req.body).length === 0) {
            return errorResponse(res, 400, "Request body is required");
        }
        const { latitude, longitude, } = req.body;
        if (latitude === undefined ||
            longitude === undefined) {
            return errorResponse(res, 400, "latitude and longitude are required");
        }
        const today = getTodayWorkDate();
        const schedule = await getTodayScheduleByEmployee(BigInt(employeeId), today);
        if (!schedule) {
            return errorResponse(res, 404, "No schedule found for today");
        }
        const attendance = schedule.attendance;
        if (!attendance) {
            return errorResponse(res, 404, "Employee has not clocked in today");
        }
        if (attendance.checkOutAt) {
            return errorResponse(res, 409, "Employee has already clocked out");
        }
        if (schedule.office.latitude === null ||
            schedule.office.longitude === null) {
            return errorResponse(res, 400, "Office location is not configured");
        }
        const employeeLatitude = Number(latitude);
        const employeeLongitude = Number(longitude);
        if (Number.isNaN(employeeLatitude) ||
            Number.isNaN(employeeLongitude)) {
            return errorResponse(res, 400, "Latitude and longitude must be valid numbers");
        }
        if (employeeLatitude < -90 ||
            employeeLatitude > 90 ||
            employeeLongitude < -180 ||
            employeeLongitude > 180) {
            return errorResponse(res, 400, "Latitude or longitude is out of range");
        }
        const officeLatitude = Number(schedule.office.latitude);
        const officeLongitude = Number(schedule.office.longitude);
        const distanceMeters = calculateDistanceMeters(employeeLatitude, employeeLongitude, officeLatitude, officeLongitude);
        const allowedRadius = schedule.office.allowedRadiusMeters;
        if (distanceMeters >
            allowedRadius) {
            return errorResponse(res, 403, `You are outside the allowed office radius. Distance: ${Math.round(distanceMeters * 100) / 100}m, allowed: ${allowedRadius}m`);
        }
        const updatedAttendance = await clockOutAttendance(attendance.id, {
            checkOutAt: new Date(),
            checkOutLatitude: employeeLatitude,
            checkOutLongitude: employeeLongitude,
            checkOutDistanceMeters: distanceMeters,
        });
        return successResponse(res, 200, "Clock out successful", serializeBigInt(updatedAttendance));
    }
    catch (error) {
        console.error("Clock out error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function getMyAttendanceHistory(req, res) {
    try {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return errorResponse(res, 403, "This user is not linked to an employee");
        }
        const monthRaw = req.query.month;
        const yearRaw = req.query.year;
        let month;
        let year;
        if (typeof monthRaw === "string" &&
            typeof yearRaw === "string") {
            month = Number(monthRaw);
            year = Number(yearRaw);
            if (!Number.isInteger(month) ||
                month < 1 ||
                month > 12) {
                return errorResponse(res, 400, "Month must be between 1 and 12");
            }
            if (!Number.isInteger(year) ||
                year < 2000) {
                return errorResponse(res, 400, "Year is invalid");
            }
        }
        const attendances = await getMyAttendances(BigInt(employeeId), month, year);
        const data = attendances.map((item) => ({
            date: item.schedule.workDate
                .toISOString()
                .split("T")[0],
            checkInAt: item.checkInAt,
            checkOutAt: item.checkOutAt,
            status: item.status,
            location: item.schedule.office.name,
        }));
        return successResponse(res, 200, "Attendance history retrieved successfully", data);
    }
    catch (error) {
        console.error("Get attendance history error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
//# sourceMappingURL=attendance.controller.js.map