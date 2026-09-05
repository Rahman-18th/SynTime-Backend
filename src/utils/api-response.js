function serializeValue(value) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (value &&
        typeof value === "object") {
        const candidate = value;
        if (candidate.constructor?.name ===
            "Decimal" &&
            typeof candidate.toNumber ===
                "function") {
            return candidate.toNumber();
        }
        if (Array.isArray(value)) {
            return value.map(serializeValue);
        }
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [
            key,
            serializeValue(nestedValue),
        ]));
    }
    return value;
}
export function successResponse(res, statusCode, message, data) {
    return res
        .status(statusCode)
        .json({
        success: true,
        message,
        ...(data !== undefined && {
            data: serializeValue(data),
        }),
    });
}
export function errorResponse(res, statusCode, message, errors) {
    return res
        .status(statusCode)
        .json({
        success: false,
        message,
        ...(errors !== undefined && {
            errors: serializeValue(errors),
        }),
    });
}
//# sourceMappingURL=api-response.js.map