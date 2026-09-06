const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

export function validateEnvironment() {
  const missing =
    requiredEnvironmentVariables.filter(
      (key) =>
        !process.env[key] ||
        !process.env[key]?.trim()
    );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const jwtSecret =
    process.env.JWT_SECRET ?? "";

  if (
    process.env.NODE_ENV ===
      "production" &&
    jwtSecret.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must contain at least 32 characters in production"
    );
  }
}

export function getCorsOrigins() {
  const configured =
    process.env.CORS_ORIGINS
      ?.split(",")
      .map(
        (origin) =>
          origin.trim()
      )
      .filter(Boolean);

  if (
    configured &&
    configured.length > 0
  ) {
    return configured;
  }

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
  }

  return [];
}

export const JWT_ISSUER =
  "syntime-api";

export const JWT_AUDIENCE =
  "syntime-client";