export declare function getAllOffices(): Promise<({
    company: {
        id: bigint;
        name: string;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    address: string | null;
    latitude: import("@prisma/client-runtime-utils").Decimal | null;
    longitude: import("@prisma/client-runtime-utils").Decimal | null;
    allowedRadiusMeters: number;
    createdAt: Date;
    updatedAt: Date;
} & {
    latitude: number | null;
    longitude: number | null;
})[]>;
export declare function getOfficeById(id: bigint): Promise<({
    company: {
        id: bigint;
        name: string;
    };
} & {
    id: bigint;
    companyId: bigint;
    name: string;
    address: string | null;
    latitude: import("@prisma/client-runtime-utils").Decimal | null;
    longitude: import("@prisma/client-runtime-utils").Decimal | null;
    allowedRadiusMeters: number;
    createdAt: Date;
    updatedAt: Date;
} & {
    latitude: number | null;
    longitude: number | null;
}) | null>;
export declare function getOfficesByCompany(companyId: bigint): Promise<({
    id: bigint;
    companyId: bigint;
    name: string;
    address: string | null;
    latitude: import("@prisma/client-runtime-utils").Decimal | null;
    longitude: import("@prisma/client-runtime-utils").Decimal | null;
    allowedRadiusMeters: number;
    createdAt: Date;
    updatedAt: Date;
} & {
    latitude: number | null;
    longitude: number | null;
})[]>;
export declare function createOffice(data: {
    companyId: bigint;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    allowedRadiusMeters?: number;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    address: string | null;
    latitude: import("@prisma/client-runtime-utils").Decimal | null;
    longitude: import("@prisma/client-runtime-utils").Decimal | null;
    allowedRadiusMeters: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateOffice(id: bigint, data: {
    companyId?: bigint;
    name?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    allowedRadiusMeters?: number;
}): Promise<{
    id: bigint;
    companyId: bigint;
    name: string;
    address: string | null;
    latitude: import("@prisma/client-runtime-utils").Decimal | null;
    longitude: import("@prisma/client-runtime-utils").Decimal | null;
    allowedRadiusMeters: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=office.service.d.ts.map