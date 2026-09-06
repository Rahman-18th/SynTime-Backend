import "dotenv/config";
import bcrypt from "bcryptjs";

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
  ["dashboard.view", "View admin dashboard"],

  ["employees.view", "View employees"],
  ["employees.create", "Create employees"],
  ["employees.update", "Update employees"],
  [
    "employees.manage_account",
    "Manage employee user accounts",
  ],

  ["attendance.view", "View attendance records"],

  ["requests.view", "View employee requests"],
  [
    "requests.review",
    "Approve or reject employee requests",
  ],

  ["payslips.view", "View payslips"],
  ["payslips.create", "Create payslips"],
  ["payslips.update", "Update payslips"],

  ["announcements.view", "View announcements"],
  ["announcements.create", "Create announcements"],
  ["announcements.update", "Update announcements"],

  ["notifications.view", "View notifications"],
  [
    "notifications.create",
    "Send manual notifications",
  ],

  ["master_data.view", "View master data"],
  ["master_data.create", "Create master data"],
  ["master_data.update", "Update master data"],

  ["settings.view", "View system settings"],
  ["settings.update", "Update system settings"],

  ["rbac.view", "View roles and permissions"],
  ["rbac.manage", "Manage roles and permissions"],

  ["audit_logs.view", "View system audit logs"],
] as const;

async function main() {
  const adminEmail =
    process.env.BOOTSTRAP_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const adminPassword =
    process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL is not configured",
    );
  }

  if (!adminPassword) {
    throw new Error(
      "BOOTSTRAP_ADMIN_PASSWORD is not configured",
    );
  }

  if (adminPassword.length < 12) {
    throw new Error(
      "BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters",
    );
  }

  console.log("Starting production bootstrap...");

  // =========================================
  // ADMIN ROLE
  // =========================================

  const adminRole = await prisma.role.upsert({
    where: {
      name: "admin",
    },
    update: {
      description: "SynTime administrator",
    },
    create: {
      name: "admin",
      description: "SynTime administrator",
    },
  });

  console.log("Admin role ready.");

  // =========================================
  // PERMISSIONS
  // =========================================

  for (const [name, description] of permissions) {
    const permission =
      await prisma.permission.upsert({
        where: {
          name,
        },
        update: {
          description,
        },
        create: {
          name,
          description,
        },
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
  }

  console.log("Admin permissions ready.");

  // =========================================
  // INITIAL ADMIN USER
  // =========================================

  const existingAdmin =
    await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: {
          id: existingAdmin.id,
        },
        data: {
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: await bcrypt.hash(
            adminPassword,
            12,
          ),
          isActive: true,
        },
      });

  if (existingAdmin) {
    console.log(
      "Existing admin found. Password was not changed.",
    );
  } else {
    console.log("Initial admin account created.");
  }

  // =========================================
  // ASSIGN ADMIN ROLE
  // =========================================

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

  // =========================================
  // FINAL VALIDATION
  // =========================================

  const adminPermissionCount =
    await prisma.rolePermission.count({
      where: {
        roleId: adminRole.id,
      },
    });

  console.log("");
  console.log("==============================");
  console.log("Production bootstrap completed");
  console.log("==============================");
  console.log(`Admin email: ${adminUser.email}`);
  console.log(
    `Admin permissions: ${adminPermissionCount}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "Production bootstrap failed:",
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });