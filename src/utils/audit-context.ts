import type {
  Request,
} from "express";

export function getAuditContext(
  req: Request
) {
  const forwardedFor =
    req.headers[
      "x-forwarded-for"
    ];

  const ipAddress =
    typeof forwardedFor ===
    "string"
      ? forwardedFor
          .split(",")[0]
          ?.trim()
      : req.ip;

  const userAgent =
    req.headers[
      "user-agent"
    ];

  return {
    ...(ipAddress && {
      ipAddress,
    }),

    ...(typeof userAgent ===
      "string" && {
      userAgent,
    }),
  };
}