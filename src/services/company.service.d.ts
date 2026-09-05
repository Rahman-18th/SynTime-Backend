export declare function getAllCompanies(): Promise<{
    id: bigint;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getCompanyById(id: bigint): Promise<{
    id: bigint;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function createCompany(data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}): Promise<{
    id: bigint;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCompany(id: bigint, data: {
    name?: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
}): Promise<{
    id: bigint;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=company.service.d.ts.map