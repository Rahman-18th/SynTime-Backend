import { createOffice, getAllOffices, getOfficeById, getOfficesByCompany, updateOffice, } from "../services/office.service.js";
import { errorResponse, successResponse, } from "../utils/api-response.js";
import { isPrismaKnownError, } from "../utils/prisma-error.js";
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
        const companyId = req.query.companyId;
        const offices = typeof companyId === "string"
            ? await getOfficesByCompany(BigInt(companyId))
            : await getAllOffices();
        return successResponse(res, 200, "Offices retrieved successfully", offices);
    }
    catch (error) {
        console.error("Get offices error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function show(req, res) {
    try {
        const id = parseId(req.params.id);
        const office = await getOfficeById(id);
        if (!office) {
            return errorResponse(res, 404, "Office not found");
        }
        return successResponse(res, 200, "Office retrieved successfully", office);
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_ID") {
            return errorResponse(res, 400, "Invalid office ID");
        }
        console.error("Get office error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function store(req, res) {
    try {
        const { companyId, name, address, latitude, longitude, allowedRadiusMeters, } = req.body ?? {};
        if (!companyId || !name) {
            return errorResponse(res, 400, "companyId and name are required");
        }
        const office = await createOffice({
            companyId: BigInt(companyId),
            name,
            ...(address !== undefined && {
                address,
            }),
            ...(latitude !== undefined && {
                latitude: Number(latitude),
            }),
            ...(longitude !== undefined && {
                longitude: Number(longitude),
            }),
            ...(allowedRadiusMeters !== undefined && {
                allowedRadiusMeters: Number(allowedRadiusMeters),
            }),
        });
        return successResponse(res, 201, "Office created successfully", office);
    }
    catch (error) {
        if (isPrismaKnownError(error)) {
            if (error.code === "P2003") {
                return errorResponse(res, 400, "Invalid company reference");
            }
        }
        console.error("Create office error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
export async function update(req, res) {
    try {
        const id = parseId(req.params.id);
        const existing = await getOfficeById(id);
        if (!existing) {
            return errorResponse(res, 404, "Office not found");
        }
        const { companyId, name, address, latitude, longitude, allowedRadiusMeters, } = req.body ?? {};
        const office = await updateOffice(id, {
            ...(companyId !== undefined && {
                companyId: BigInt(companyId),
            }),
            ...(name !== undefined && {
                name,
            }),
            ...(address !== undefined && {
                address,
            }),
            ...(latitude !== undefined && {
                latitude: latitude === null
                    ? null
                    : Number(latitude),
            }),
            ...(longitude !== undefined && {
                longitude: longitude === null
                    ? null
                    : Number(longitude),
            }),
            ...(allowedRadiusMeters !== undefined && {
                allowedRadiusMeters: Number(allowedRadiusMeters),
            }),
        });
        return successResponse(res, 200, "Office updated successfully", office);
    }
    catch (error) {
        console.error("Update office error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
}
//# sourceMappingURL=office.controller.js.map