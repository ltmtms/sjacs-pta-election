export type AppEnv = {
  nodeEnv: string;
  isProduction: boolean;
  databaseUrl: string;
  sessionSecret: string;
  adminPassword: string;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  turnstileBypassDev: boolean;
  transparencyCommitmentSecret: string;
  emailProvider: "stub" | "resend";
  resendApiKey: string;
  appUrl: string;
};

const WEAK_SESSION_SECRETS = new Set([
  "dev-session-secret-change-me",
  "changeme",
  "secret",
]);

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function getEnv(): AppEnv {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";

  const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";
  const turnstileBypassDev = process.env.TURNSTILE_BYPASS_DEV === "true";
  const emailProvider = (process.env.EMAIL_PROVIDER ?? "stub") as "stub" | "resend";

  if (isProduction && !isBuildPhase()) {
    if (WEAK_SESSION_SECRETS.has(sessionSecret) || sessionSecret.length < 32) {
      throw new Error(
        "SESSION_SECRET must be at least 32 characters and not a default value in production",
      );
    }
    if (turnstileBypassDev) {
      throw new Error("TURNSTILE_BYPASS_DEV must not be enabled in production");
    }
    if (emailProvider === "stub") {
      throw new Error("EMAIL_PROVIDER=stub is not allowed in production");
    }
    if (!process.env.TURNSTILE_SECRET_KEY || !process.env.TURNSTILE_SITE_KEY) {
      throw new Error("Turnstile keys are required in production");
    }
    if (!process.env.TRANSPARENCY_COMMITMENT_SECRET) {
      throw new Error("TRANSPARENCY_COMMITMENT_SECRET is required in production");
    }
    if (!process.env.DATABASE_URL?.startsWith("postgres")) {
      throw new Error("DATABASE_URL must be a PostgreSQL URL in production");
    }
  }

  const databaseUrl =
    process.env.DATABASE_URL ??
    (isProduction ? "" : "file:./data/local.sqlite");

  return {
    nodeEnv,
    isProduction,
    databaseUrl,
    sessionSecret,
    adminPassword: process.env.ADMIN_PASSWORD ?? "admin-dev-only",
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY ?? "",
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
    turnstileBypassDev: !isProduction && turnstileBypassDev,
    transparencyCommitmentSecret:
      process.env.TRANSPARENCY_COMMITMENT_SECRET ?? "dev-transparency-secret",
    emailProvider: isProduction ? emailProvider : emailProvider,
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    appUrl: process.env.APP_URL ?? "http://localhost:3000",
  };
}

/** Safe for client bundles — only public values. */
export function getPublicEnv() {
  const env = getEnv();
  return {
    turnstileSiteKey: env.turnstileSiteKey,
    turnstileBypassDev: env.turnstileBypassDev,
    appUrl: env.appUrl,
  };
}
