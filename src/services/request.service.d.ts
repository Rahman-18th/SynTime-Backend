export declare function getAllRequests(): Promise<({
    attachments: {
        id: bigint;
        requestId: bigint;
        fileName: string;
        fileUrl: string;
        fileType: string | null;
        fileSize: bigint | null;
        createdAt: Date;
    }[];
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
    reviewer: {
        createdAt: Date;
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    } | null;
} & {
    id: bigint;
    employeeId: bigint;
    reviewedBy: bigint | null;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getRequestById(id: bigint): Promise<({
    attachments: {
        id: bigint;
        requestId: bigint;
        fileName: string;
        fileUrl: string;
        fileType: string | null;
        fileSize: bigint | null;
        createdAt: Date;
    }[];
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
    reviewer: {
        createdAt: Date;
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    } | null;
} & {
    id: bigint;
    employeeId: bigint;
    reviewedBy: bigint | null;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function getRequestsByEmployee(employeeId: bigint): Promise<({
    attachments: {
        id: bigint;
        requestId: bigint;
        fileName: string;
        fileUrl: string;
        fileType: string | null;
        fileSize: bigint | null;
        createdAt: Date;
    }[];
    reviewer: {
        createdAt: Date;
        email: string;
        employeeId: bigint | null;
        id: bigint;
        isActive: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    } | null;
} & {
    id: bigint;
    employeeId: bigint;
    reviewedBy: bigint | null;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function createRequest(data: {
    employeeId: bigint;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    reviewedBy: bigint | null;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function reviewRequest(id: bigint, data: {
    reviewedBy: bigint;
    status: string;
    reviewNote?: string;
    reviewedAt: Date;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    reviewedBy: bigint | null;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=request.service.d.ts.map