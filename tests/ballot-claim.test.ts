import { mkdirSync, rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dbPath = "./data/test-claim.sqlite";

beforeAll(async () => {
  rmSync("./data", { recursive: true, force: true });
  mkdirSync("./data", { recursive: true });
  process.env.DATABASE_URL = `file:${dbPath}`;
  process.env.NODE_ENV = "test";
  const { execSync } = await import("node:child_process");
  execSync("npx tsx scripts/migrate.ts", { stdio: "inherit" });
});

afterAll(() => {
  rmSync("./data", { recursive: true, force: true });
});

describe("atomic ballot claim", () => {
  it("claims code once", async () => {
    const { issueBallotCode } = await import("@/lib/election");
    const { claimBallotCode } = await import("@/lib/ballot-claim");
    await issueBallotCode("TEST", "hash1");

    const first = await claimBallotCode("TEST");
    expect(first.ok).toBe(true);

    const second = await claimBallotCode("TEST");
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("already_claimed");
  });
});
