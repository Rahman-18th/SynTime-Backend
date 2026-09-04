import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const permissions = [
  {
    name: "dashboard.view",
    description: "View admin dashboard",
  },

  {
    name: "employees.view",
    description: "View employees",
  },
  {
    name: "employees.create",
    description: "Create employees",
  },
  {
    name: "employees.update",
    description: "Update employees",
  },
  {
    name: "employees.manage_account",
    description: "Manage employee user accounts",
  },

  {
    name: "attendance.view",
    description: "View attendance records",
  },

  {
    name: "requests.view",
    description: "View employee requests",
  },
  {
    name: "requests.review",
    description: "Approve or reject employee requests",
  },

  {
    name: "payslips.view",
    description: "View payslips",
  },
  {
    name: "payslips.create",
    description: "Create payslips",
  },
  {
    name: "payslips.update",
    description: "Update payslips",
  },

  {
    name: "announcements.view",
    description: "View announcements",
  },
  {
    name: "announcements.create",
    description: "Create announcements",
  },
  {
    name: "announcements.update",
    description: "Update announcements",
  },

  {
    name: "notifications.view",
    description: "View notifications",
  },
  {
    name: "notifications.create",
    description: "Send manual notifications",
  },

  {
    name: "master_data.view",
    description: "View master data",
  },
  {
    name: "master_data.create",
    description: "Create master data",
  },
  {
    name: "master_data.update",
    description: "Update master data",
  },

  {
    name: "rbac.view",
    description: "View roles and permissions",
  },
  {
    name: "rbac.manage",
    description: "Manage roles and permissions",
  },
];

async function main() {
  console.log("Starting RBAC seed...");

  const adminRole = await prisma.role.findUnique({
    where: {
      name: "admin",
    },
  });

  if (!adminRole) {
    throw new Error(
      'Admin role not found. Create role "admin" first.',
    );
  }

  console.log(
    `Admin role found: ${adminRole.name} (${adminRole.id})`,
  );

  for (const permissionData of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        name: permissionData.name,
      },

      update: {
        description: permissionData.description,
      },

      create: permissionData,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },

      update: {},

      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });

    console.log(
      `✓ ${permission.name} assigned to admin`,
    );
  }

  const totalPermissions =
    await prisma.permission.count();

  const adminPermissionCount =
    await prisma.rolePermission.count({
      where: {
        roleId: adminRole.id,
      },
    });

  console.log("");
  console.log("RBAC seed completed.");
  console.log(
    `Total permissions: ${totalPermissions}`,
  );
  console.log(
    `Admin permissions: ${adminPermissionCount}`,
  );
}

main()
  .catch((error) => {
    console.error("RBAC seed failed:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });