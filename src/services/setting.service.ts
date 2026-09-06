import prisma
  from "../config/prisma.js";

export const DEFAULT_SETTINGS = {
  timezone:
    "Asia/Jakarta",

  default_company_id:
    "",

  default_office_id:
    "",

  default_attendance_radius:
    "150",

  system_name:
    "SynTime",
};

export async function getAllSettings() {
  const rows =
    await prisma
      .systemSetting
      .findMany({
        orderBy: {
          key: "asc",
        },
      });

  const result = {
    ...DEFAULT_SETTINGS,
  };

  for (const row of rows) {
    result[
      row.key as keyof typeof result
    ] =
      row.value;
  }

  return result;
}

export async function validateSettingsReferences(
  settings: Record<
    string,
    string
  >
) {
  let companyId:
    | bigint
    | null =
    null;

  let officeId:
    | bigint
    | null =
    null;

  if (
    settings.default_company_id
  ) {
    try {
      companyId =
        BigInt(
          settings
            .default_company_id
        );
    } catch {
      throw new Error(
        "INVALID_DEFAULT_COMPANY_ID"
      );
    }

    const company =
      await prisma.company
        .findUnique({
          where: {
            id:
              companyId,
          },

          select: {
            id: true,
          },
        });

    if (!company) {
      throw new Error(
        "DEFAULT_COMPANY_NOT_FOUND"
      );
    }
  }

  if (
    settings.default_office_id
  ) {
    try {
      officeId =
        BigInt(
          settings
            .default_office_id
        );
    } catch {
      throw new Error(
        "INVALID_DEFAULT_OFFICE_ID"
      );
    }

    const office =
      await prisma.office
        .findUnique({
          where: {
            id:
              officeId,
          },

          select: {
            id: true,
            companyId: true,
          },
        });

    if (!office) {
      throw new Error(
        "DEFAULT_OFFICE_NOT_FOUND"
      );
    }

    if (
      companyId !==
        null &&
      office.companyId !==
        companyId
    ) {
      throw new Error(
        "OFFICE_COMPANY_MISMATCH"
      );
    }
  }
}

export async function updateSettings(
  settings: Record<
    string,
    string
  >
) {
  const allowedKeys =
    Object.keys(
      DEFAULT_SETTINGS
    );

  const entries =
    Object.entries(
      settings
    ).filter(
      ([key]) =>
        allowedKeys.includes(
          key
        )
    );

  await prisma.$transaction(
    entries.map(
      ([key, value]) =>
        prisma
          .systemSetting
          .upsert({
            where: {
              key,
            },

            update: {
              value,
            },

            create: {
              key,
              value,
            },
          })
    )
  );

  return getAllSettings();
}