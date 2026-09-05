export declare function getAllAttendances(): Promise<({
    schedule: {
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
    };
} & {
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
})[]>;
export declare function getAttendanceById(id: bigint): Promise<({
    schedule: {
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
    };
} & {
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
}) | null>;
export declare function clockInAttendance(data: {
    scheduleId: bigint;
    checkInAt: Date;
    status: string;
    checkInLatitude: number;
    checkInLongitude: number;
    checkInDistanceMeters: number;
}): Promise<{
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
}>;
export declare function clockOutAttendance(id: bigint, data: {
    checkOutAt: Date;
    checkOutLatitude: number;
    checkOutLongitude: number;
    checkOutDistanceMeters: number;
}): Promise<{
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
}>;
export declare function getAttendanceBySchedule(scheduleId: bigint): Promise<{
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
} | null>;
export declare function getScheduleForAttendance(scheduleId: bigint): Promise<({
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
export declare function getTodayScheduleByEmployee(employeeId: bigint, workDate: Date): Promise<({
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
export declare function getMyAttendances(employeeId: bigint, month?: number, year?: number): Promise<({
    schedule: {
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
    };
} & {
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
})[]>;
//# sourceMappingURL=attendance.service.d.ts.map