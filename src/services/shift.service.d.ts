export declare function getAllShifts(): Promise<({
    company: {
        id: bigint;
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    startTime: Date;
    endTime: Date;
    breakStart: Date | null;
    breakEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getShiftById(id: bigint): Promise<({
    company: {
        id: bigint;
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    startTime: Date;
    endTime: Date;
    breakStart: Date | null;
    breakEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function createShift(data: {
    companyId: bigint;
    name: string;
    startTime: Date;
    endTime: Date;
    breakStart?: Date;
    breakEnd?: Date;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    startTime: Date;
    endTime: Date;
    breakStart: Date | null;
    breakEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateShift(id: bigint, data: {
    name?: string;
    startTime?: Date;
    endTime?: Date;
    breakStart?: Date;
    breakEnd?: Date;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    startTime: Date;
    endTime: Date;
    breakStart: Date | null;
    breakEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=shift.service.d.ts.map