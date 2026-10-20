import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  generateBallotCode,
  isValidCodeFormat,
  normalizeCode,
} from "@/lib/codes";

describe("ballot codes", () => {
  it("uses alphabet without I or O", () => {
    expect(CODE_ALPHABET).not.toContain("I");
    expect(CODE_ALPHABET).not.toContain("O");
    expect(CODE_ALPHABET.length).toBe(24);
  });

  it("generates 4-letter codes", () => {
    const code = generateBallotCode(() => 0);
    expect(code).toHaveLength(4);
    expect(isValidCodeFormat(code)).toBe(true);
  });

  it("rejects invalid characters", () => {
    expect(isValidCodeFormat("ABIO")).toBe(false);
    expect(isValidCodeFormat("ABC")).toBe(false);
    expect(isValidCodeFormat("ABCD")).toBe(true);
  });

  it("normalizes case", () => {
    expect(normalizeCode(" abcd ")).toBe("ABCD");
  });
});
