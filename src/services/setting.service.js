import prisma from "../config/prisma.js";
export const DEFAULT_SETTINGS = {
    timezone: "Asia/Jakarta",
    default_company_id: "",
    default_office_id: "",
    default_attendance_radius: "150",
    system_name: "SynTime",
};
export async function getAllSettings() {
    const rows = await prisma.systemSetting.findMany({
        orderBy: {
            key: "asc",
        },
    });
    const result = {
        ...DEFAULT_SETTINGS,
    };
    for (const row of rows) {
        result[row.key] = row.value;
    }
    return result;
}
export async function updateSettings(settings) {
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const entries = Object.entries(settings).filter(([key]) => allowedKeys.includes(key));
    await prisma.$transaction(entries.map(([key, value]) => prisma.systemSetting.upsert({
        where: {
            key,
        },
        update: {
            value,
        },
        create: {
            key,
            value,
        },
    })));
    return getAllSettings();
}
//# sourceMappingURL=setting.service.js.map