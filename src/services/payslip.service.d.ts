export declare function getAllPayslips(): Promise<({
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
} & {
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getPayslipById(id: bigint): Promise<({
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
} & {
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function getPayslipsByEmployee(employeeId: bigint): Promise<{
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getPublishedPayslipsByEmployee(employeeId: bigint): Promise<{
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createPayslip(data: {
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: number;
    totalIncome: number;
    totalDeduction: number;
    status?: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updatePayslip(id: bigint, data: {
    basicSalary?: number;
    totalIncome?: number;
    totalDeduction?: number;
    status?: string;
}): Promise<{
    id: bigint;
    employeeId: bigint;
    periodMonth: number;
    periodYear: number;
    basicSalary: import("@prisma/client-runtime-utils").Decimal;
    totalIncome: import("@prisma/client-runtime-utils").Decimal;
    totalDeduction: import("@prisma/client-runtime-utils").Decimal;
    takeHomePay: import("@prisma/client-runtime-utils").Decimal;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=payslip.service.d.ts.map