import {
  createAuditLog,
} from "../services/audit-log.service.js";

type AuditData = Parameters<typeof createAuditLog>[0];

export async function writeAuditLog(
  data: AuditData
) {
  try {
    await createAuditLog(data);
  } catch (error) {
    console.error("Audit log error:", error);
  }
}