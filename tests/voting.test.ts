import { describe, expect, it } from "vitest";
import { MAX_TOTAL, tallyVotes, validateSelections } from "@/lib/voting";

describe("validateSelections", () => {
  const primary = new Set([1, 2, 3]);
  const secondary = new Set([4, 5, 6]);

  it("allows empty ballot", () => {
    expect(
      validateSelections({ primaryIds: [], secondaryIds: [] }, primary, secondary).ok,
    ).toBe(true);
  });

  it("enforces per-category and total limits", () => {
    const bigPrimary = new Set([1, 2, 3, 4, 5, 6, 7]);
    const manyPrimary = [1, 2, 3, 4, 5, 6, 7];
    expect(
      validateSelections({ primaryIds: manyPrimary, secondaryIds: [] }, bigPrimary, secondary).ok,
    ).toBe(false);

    const atTotal = [1, 2, 3, 4, 5, 6, 1];
    expect(
      validateSelections(
        { primaryIds: atTotal.slice(0, 6), secondaryIds: atTotal.slice(6) },
        primary,
        secondary,
      ).ok,
    ).toBe(false);
  });

  it("rejects overlap between lists", () => {
    expect(
      validateSelections({ primaryIds: [1], secondaryIds: [1] }, primary, secondary).ok,
    ).toBe(false);
  });

  it("respects MAX_TOTAL of 11", () => {
    const bigPrimary = new Set(Array.from({ length: 12 }, (_, i) => i + 1));
    const bigSecondary = new Set(Array.from({ length: 12 }, (_, i) => i + 20));
    const result = validateSelections(
      {
        primaryIds: [1, 2, 3, 4, 5, 6],
        secondaryIds: [20, 21, 22, 23, 24, 25],
      },
      bigPrimary,
      bigSecondary,
    );
    expect(result.ok).toBe(false);
    expect(MAX_TOTAL).toBe(11);
  });
});

describe("tallyVotes", () => {
  it("counts votes per candidate", () => {
    const { primary, secondary } = tallyVotes([
      { primaryIds: [1, 2], secondaryIds: [3] },
      { primaryIds: [1], secondaryIds: [3, 4] },
    ]);
    expect(primary.get(1)).toBe(2);
    expect(primary.get(2)).toBe(1);
    expect(secondary.get(3)).toBe(2);
    expect(secondary.get(4)).toBe(1);
  });
});
