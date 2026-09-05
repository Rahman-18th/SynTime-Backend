export declare const DEFAULT_SETTINGS: {
    timezone: string;
    default_company_id: string;
    default_office_id: string;
    default_attendance_radius: string;
    system_name: string;
};
export declare function getAllSettings(): Promise<{
    timezone: string;
    default_company_id: string;
    default_office_id: string;
    default_attendance_radius: string;
    system_name: string;
}>;
export declare function updateSettings(settings: Record<string, string>): Promise<{
    timezone: string;
    default_company_id: string;
    default_office_id: string;
    default_attendance_radius: string;
    system_name: string;
}>;
//# sourceMappingURL=setting.service.d.ts.map