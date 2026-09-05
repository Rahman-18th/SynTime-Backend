import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const company = await prisma.company.upsert({
    where: {
        id: BigInt(1),
    },
    update: {},
    create: {
        name: "PT SynTime Demo",
        address: "Jakarta",
        email: "contact@syntime.local",
    },
});
const itDepartment = await prisma.department.upsert({
    where: {
        companyId_name: {
            companyId: company.id,
            name: "IT",
        },
    },
    update: {},
    create: {
        companyId: company.id,
        name: "IT",
        description: "Information Technology Department",
    },
});
const hrDepartment = await prisma.department.upsert({
    where: {
        companyId_name: {
            companyId: company.id,
            name: "HR",
        },
    },
    update: {},
    create: {
        companyId: company.id,
        name: "HR",
        description: "Human Resources Department",
    },
});
let office = await prisma.office.findFirst({
    where: {
        companyId: company.id,
        name: "Head Office",
    },
});
if (!office) {
    office = await prisma.office.create({
        data: {
            companyId: company.id,
            name: "Head Office",
            address: "Jakarta",
            latitude: -6.2000000,
            longitude: 106.8166667,
            allowedRadiusMeters: 150,
        },
    });
}
async function main() {
    const adminRole = await prisma.role.upsert({
        where: {
            name: "admin",
        },
        update: {},
        create: {
            name: "admin",
            description: "SynTime administrator",
        },
    });
    const passwordHash = await bcrypt.hash("Admin123!", 12);
    const adminUser = await prisma.user.upsert({
        where: {
            email: "admin@syntime.local",
        },
        update: {
            passwordHash,
            isActive: true,
        },
        create: {
            email: "admin@syntime.local",
            passwordHash,
            isActive: true,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    console.log("Seed completed");
    console.log("Admin:", adminUser.email);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
const employeeRole = await prisma.role.upsert({
    where: {
        name: "employee",
    },
    update: {},
    create: {
        name: "employee",
        description: "Employee role",
    },
});
const testEmployee = await prisma.employee.findFirst({
    where: {
        employeeNumber: "EMP-2026001",
    },
});
if (!testEmployee) {
    throw new Error("Test employee EMP-2026001 not found");
}
const employeePasswordHash = await bcrypt.hash("Employee123!", 12);
const employeeUser = await prisma.user.upsert({
    where: {
        email: "employee@syntime.local",
    },
    update: {
        employeeId: testEmployee.id,
        passwordHash: employeePasswordHash,
        isActive: true,
    },
    create: {
        employeeId: testEmployee.id,
        email: "employee@syntime.local",
        passwordHash: employeePasswordHash,
        isActive: true,
    },
});
await prisma.userRole.upsert({
    where: {
        userId_roleId: {
            userId: employeeUser.id,
            roleId: employeeRole.id,
        },
    },
    update: {},
    create: {
        userId: employeeUser.id,
        roleId: employeeRole.id,
    },
});
console.log("Employee user:", employeeUser.email);
console.log("Organization seeded");
console.log("Company ID:", company.id.toString());
console.log("IT Department ID:", itDepartment.id.toString());
console.log("HR Department ID:", hrDepartment.id.toString());
console.log("Office ID:", office.id.toString());
//# sourceMappingURL=seed.js.map