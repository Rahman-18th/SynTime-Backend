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