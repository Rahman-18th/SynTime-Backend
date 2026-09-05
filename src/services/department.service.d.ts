export declare function getAllDepartments(): Promise<({
    company: {
        id: bigint;
        name: string;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getDepartmentById(id: bigint): Promise<({
    company: {
        id: bigint;
        name: string;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function getDepartmentsByCompany(companyId: bigint): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createDepartment(data: {
    companyId: bigint;
    name: string;
    description?: string;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateDepartment(id: bigint, data: {
    companyId?: bigint;
    name?: string;
    description?: string | null;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=department.service.d.ts.map