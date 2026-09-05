export declare function createNotification(data: {
    employeeId: bigint;
    title: string;
    message: string;
    type?: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    title: string;
    message: string;
    type: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}>;
export declare function getAllNotifications(): Promise<({
    employee: {
        email: string;
        employeeNumber: string;
        firstName: string;
        id: bigint;
        lastName: string | null;
        position: string | null;
        status: string;
    };
} & {
    id: bigint;
    employeeId: bigint;
    title: string;
    message: string;
    type: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
})[]>;
export declare function getNotificationsByEmployee(employeeId: bigint): Promise<{
    id: bigint;
    employeeId: bigint;
    title: string;
    message: string;
    type: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}[]>;
export declare function markNotificationAsRead(id: bigint, employeeId: bigint): Promise<import("../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
//# sourceMappingURL=notification.service.d.ts.map