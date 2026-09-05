export declare function getAllSchedules(): Promise<({
    attendance: {
        id: bigint;
        scheduleId: bigint;
        checkInAt: Date | null;
        checkOutAt: Date | null;
        checkInLatitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkInLongitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutLatitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutLongitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkInDistanceMeters: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutDistanceMeters: import("@prisma/client-runtime-utils").Decimal | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    employee: {
        id: bigint;
        companyId: bigint;
        departmentId: bigint;
        officeId: bigint;
        employeeNumber: string;
        firstName: string;
        lastName: string | null;
        email: string;
        phone: string | null;
        position: string | null;
        workType: string | null;
        joinDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
    office: {
        id: bigint;
        companyId: bigint;
        name: string;
        address: string | null;
        latitude: import("@prisma/client-runtime-utils").Decimal | null;
        longitude: import("@prisma/client-runtime-utils").Decimal | null;
        allowedRadiusMeters: number;
        createdAt: Date;
        updatedAt: Date;
    };
    shift: {
        id: bigint;
        companyId: bigint;
        name: string;
        startTime: Date;
        endTime: Date;
        breakStart: Date | null;
        breakEnd: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: bigint;
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getScheduleById(id: bigint): Promise<({
    attendance: {
        id: bigint;
        scheduleId: bigint;
        checkInAt: Date | null;
        checkOutAt: Date | null;
        checkInLatitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkInLongitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutLatitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutLongitude: import("@prisma/client-runtime-utils").Decimal | null;
        checkInDistanceMeters: import("@prisma/client-runtime-utils").Decimal | null;
        checkOutDistanceMeters: import("@prisma/client-runtime-utils").Decimal | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    employee: {
        id: bigint;
        companyId: bigint;
        departmentId: bigint;
        officeId: bigint;
        employeeNumber: string;
        firstName: string;
        lastName: string | null;
        email: string;
        phone: string | null;
        position: string | null;
        workType: string | null;
        joinDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
    office: {
        id: bigint;
        companyId: bigint;
        name: string;
        address: string | null;
        latitude: import("@prisma/client-runtime-utils").Decimal | null;
        longitude: import("@prisma/client-runtime-utils").Decimal | null;
        allowedRadiusMeters: number;
        createdAt: Date;
        updatedAt: Date;
    };
    shift: {
        id: bigint;
        companyId: bigint;
        name: string;
        startTime: Date;
        endTime: Date;
        breakStart: Date | null;
        breakEnd: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: bigint;
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function createSchedule(data: {
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status?: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateSchedule(id: bigint, data: {
    employeeId?: bigint;
    shiftId?: bigint;
    officeId?: bigint;
    workDate?: Date;
    status?: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    shiftId: bigint;
    officeId: bigint;
    workDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=schedule.service.d.ts.map