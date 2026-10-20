import { afterEach, describe, expect, it } from "vitest";

describe("production env hardening", () => {
  const orig = { ...process.env };

  afterEach(() => {
    process.env = { ...orig };
  });

  it("blocks weak session secret in production at runtime", async () => {
    process.env.NODE_ENV = "production";
    process.env.SESSION_SECRET = "short";
    process.env.DATABASE_URL = "postgresql://user:pass@localhost/db";
    process.env.TURNSTILE_SITE_KEY = "site";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.TRANSPARENCY_COMMITMENT_SECRET = "transparency-secret-32chars-minimum!!";
    process.env.EMAIL_PROVIDER = "resend";
    process.env.TURNSTILE_BYPASS_DEV = "false";
    delete process.env.NEXT_PHASE;

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/SESSION_SECRET/);
  });

  it("blocks turnstile bypass in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.SESSION_SECRET = "a-very-long-production-session-secret-key!!";
    process.env.DATABASE_URL = "postgresql://user:pass@localhost/db";
    process.env.TURNSTILE_SITE_KEY = "site";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.TRANSPARENCY_COMMITMENT_SECRET = "transparency-secret-32chars-minimum!!";
    process.env.EMAIL_PROVIDER = "resend";
    process.env.TURNSTILE_BYPASS_DEV = "true";
    delete process.env.NEXT_PHASE;

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/TURNSTILE_BYPASS_DEV/);
  });
});
