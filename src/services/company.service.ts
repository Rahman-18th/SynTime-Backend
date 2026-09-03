import prisma from "../config/prisma.js";

export async function getAllCompanies() {
  return prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCompanyById(
  id: bigint
) {
  return prisma.company.findUnique({
    where: {
      id,
    },
  });
}

export async function createCompany(data: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  return prisma.company.create({
    data: {
      name: data.name,

      ...(data.address !== undefined && {
        address: data.address,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.email !== undefined && {
        email: data.email,
      }),
    },
  });
}

export async function updateCompany(
  id: bigint,
  data: {
    name?: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  }
) {
  return prisma.company.update({
    where: {
      id,
    },

    data,
  });
}