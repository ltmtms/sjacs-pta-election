import { and, eq, isNull } from "drizzle-orm";
import { getDb, getSchemaTables } from "@/db";
import { isValidCodeFormat, normalizeCode } from "./codes";

export type ClaimResult =
  | { ok: true; ballotSessionId: string }
  | { ok: false; reason: "invalid" | "already_claimed" | "not_found" };

/**
 * Atomically claim a ballot code. Returns a session id used to authorize vote submission.
 * The anonymous ballot row is created only on vote submit; claim reserves the code.
 */
export async function claimBallotCode(code: string): Promise<ClaimResult> {
  const normalized = normalizeCode(code);
  if (!isValidCodeFormat(normalized)) {
    return { ok: false, reason: "invalid" };
  }

  const db = getDb();
  const { ballotCodes } = getSchemaTables();

  const rows = (await db
    .select()
    .from(ballotCodes)
    .where(eq(ballotCodes.code, normalized))
    .limit(1)) as { id: number; claimedAt: string | null }[];

  const row = rows[0];
  if (!row) return { ok: false, reason: "not_found" };
  if (row.claimedAt) return { ok: false, reason: "already_claimed" };

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const updated = (await db
    .update(ballotCodes)
    .set({ claimedAt: now })
    .where(and(eq(ballotCodes.id, row.id), isNull(ballotCodes.claimedAt)))
    .returning({ id: ballotCodes.id })) as { id: number }[];

  if (updated.length === 0) {
    return { ok: false, reason: "already_claimed" };
  }

  return { ok: true, ballotSessionId: `${row.id}:${sessionId}` };
}

export function parseBallotSessionId(
  sessionId: string,
): { codeId: number; token: string } | null {
  const [idPart, token] = sessionId.split(":");
  const codeId = Number(idPart);
  if (!Number.isInteger(codeId) || !token) return null;
  return { codeId, token };
}
