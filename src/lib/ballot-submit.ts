import { eq } from "drizzle-orm";
import { getDb, getSchemaTables } from "@/db";
import type { BallotSelections } from "./voting";
import { parseBallotSessionId } from "./ballot-claim";

export type SubmitResult =
  | { ok: true; ballotId: number }
  | { ok: false; reason: "invalid_session" | "already_submitted" | "not_claimed" };

export async function submitAnonymousBallot(
  ballotSessionId: string,
  selections: BallotSelections,
): Promise<SubmitResult> {
  const parsed = parseBallotSessionId(ballotSessionId);
  if (!parsed) return { ok: false, reason: "invalid_session" };

  const db = getDb();
  const { ballotCodes, ballots } = getSchemaTables();

  const rows = (await db
    .select()
    .from(ballotCodes)
    .where(eq(ballotCodes.id, parsed.codeId))
    .limit(1)) as {
    claimedAt: string | null;
    ballotId: number | null;
  }[];

  const codeRow = rows[0];
  if (!codeRow || !codeRow.claimedAt) {
    return { ok: false, reason: "not_claimed" };
  }
  if (codeRow.ballotId) {
    return { ok: false, reason: "already_submitted" };
  }

  const inserted = (await db
    .insert(ballots)
    .values({
      primaryChoices: JSON.stringify(selections.primaryIds),
      secondaryChoices: JSON.stringify(selections.secondaryIds),
    })
    .returning({ id: ballots.id })) as { id: number }[];

  const ballotId = inserted[0]?.id;
  if (!ballotId) {
    throw new Error("Failed to insert ballot");
  }

  const linked = (await db
    .update(ballotCodes)
    .set({ ballotId })
    .where(eq(ballotCodes.id, parsed.codeId))
    .returning({ id: ballotCodes.id, ballotId: ballotCodes.ballotId })) as {
    id: number;
    ballotId: number | null;
  }[];

  if (linked.length === 0 || linked[0].ballotId !== ballotId) {
    return { ok: false, reason: "already_submitted" };
  }

  return { ok: true, ballotId };
}
