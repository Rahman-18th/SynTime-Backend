import {
  createAuditLog,
} from "../services/audit-log.service.js";

import type {
  CreateAuditLogData,
} from "../services/audit-log.service.js";

export async function writeAuditLog(
  data: CreateAuditLogData
) {
  try {
    await createAuditLog(
      data
    );
  } catch (error) {
    console.error(
      "Audit log error:",
      error
    );
  }
}