export const MAX_PRIMARY = 6;
export const MAX_SECONDARY = 6;
export const MAX_TOTAL = 11;

export type CandidateCategory = "primary" | "secondary";

export type BallotSelections = {
  primaryIds: number[];
  secondaryIds: number[];
};

export function validateSelections(
  selections: BallotSelections,
  validPrimaryIds: Set<number>,
  validSecondaryIds: Set<number>,
): { ok: true } | { ok: false; error: string } {
  const { primaryIds, secondaryIds } = selections;

  if (primaryIds.length > MAX_PRIMARY) {
    return { ok: false, error: `At most ${MAX_PRIMARY} primary choices` };
  }
  if (secondaryIds.length > MAX_SECONDARY) {
    return { ok: false, error: `At most ${MAX_SECONDARY} secondary choices` };
  }
  if (primaryIds.length + secondaryIds.length > MAX_TOTAL) {
    return { ok: false, error: `At most ${MAX_TOTAL} choices in total` };
  }

  const uniquePrimary = new Set(primaryIds);
  const uniqueSecondary = new Set(secondaryIds);
  if (uniquePrimary.size !== primaryIds.length) {
    return { ok: false, error: "Duplicate primary choices" };
  }
  if (uniqueSecondary.size !== secondaryIds.length) {
    return { ok: false, error: "Duplicate secondary choices" };
  }

  for (const id of primaryIds) {
    if (!validPrimaryIds.has(id)) {
      return { ok: false, error: "Invalid primary candidate" };
    }
  }
  for (const id of secondaryIds) {
    if (!validSecondaryIds.has(id)) {
      return { ok: false, error: "Invalid secondary candidate" };
    }
  }

  const overlap = primaryIds.some((id) => uniqueSecondary.has(id));
  if (overlap) {
    return { ok: false, error: "Same candidate cannot be primary and secondary" };
  }

  return { ok: true };
}

export function tallyVotes(
  ballots: BallotSelections[],
): { primary: Map<number, number>; secondary: Map<number, number> } {
  const primary = new Map<number, number>();
  const secondary = new Map<number, number>();
  for (const b of ballots) {
    for (const id of b.primaryIds) {
      primary.set(id, (primary.get(id) ?? 0) + 1);
    }
    for (const id of b.secondaryIds) {
      secondary.set(id, (secondary.get(id) ?? 0) + 1);
    }
  }
  return { primary, secondary };
}
