import { describe, expect, it } from "vitest";
import {
  buildTransparencyPayload,
  codeCommitment,
  commitmentRoot,
} from "@/lib/transparency";

describe("transparency commitments", () => {
  const secret = "test-secret-key";

  it("produces stable HMAC leaf per code", () => {
    const a = codeCommitment(secret, "ABCD");
    const b = codeCommitment(secret, "abcd");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("root is order-independent via sorted leaves", () => {
    const r1 = commitmentRoot(secret, ["WXYZ", "ABCD"]);
    const r2 = commitmentRoot(secret, ["ABCD", "WXYZ"]);
    expect(r1).toBe(r2);
  });

  it("open mode hides codes", () => {
    const payload = buildTransparencyPayload(secret, ["ABCD", "WXYZ"], 2, true);
    expect(payload.mode).toBe("open");
    if (payload.mode === "open") {
      expect(payload.turnout).toBe(2);
      expect("codes" in payload).toBe(false);
    }
  });

  it("closed mode publishes codes", () => {
    const payload = buildTransparencyPayload(secret, ["WXYZ", "ABCD"], 2, false);
    expect(payload.mode).toBe("closed");
    if (payload.mode === "closed") {
      expect(payload.codes).toEqual(["ABCD", "WXYZ"]);
      expect(payload.commitmentRoot).toBe(commitmentRoot(secret, ["ABCD", "WXYZ"]));
    }
  });
});
