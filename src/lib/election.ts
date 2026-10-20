import { eq } from "drizzle-orm";
import { getDb, getSchemaTables } from "@/db";
import type { BallotRow, CandidateRow } from "@/db/types";
import type { BallotSelections } from "./voting";

export async function getElectionOpen(): Promise<boolean> {
  const db = getDb();
  const { electionSettings } = getSchemaTables();
  const rows = (await db.select().from(electionSettings).limit(1)) as {
    isOpen: boolean;
  }[];
  return Boolean(rows[0]?.isOpen);
}

export async function getActiveCandidates(): Promise<CandidateRow[]> {
  const db = getDb();
  const { candidates } = getSchemaTables();
  const rows = (await db
    .select()
    .from(candidates)
    .where(eq(candidates.active, true))) as CandidateRow[];
  return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

export async function getTurnout(): Promise<number> {
  const db = getDb();
  const { ballots } = getSchemaTables();
  const rows = await db.select({ id: ballots.id }).from(ballots);
  return rows.length;
}

export async function getAllBallotCodes(): Promise<string[]> {
  const db = getDb();
  const { ballotCodes } = getSchemaTables();
  const rows = await db.select({ code: ballotCodes.code }).from(ballotCodes);
  return rows.map((r) => r.code);
}

export async function getAllBallotSelections(): Promise<BallotSelections[]> {
  const db = getDb();
  const { ballots } = getSchemaTables();
  const rows = (await db.select().from(ballots)) as BallotRow[];
  return rows.map((r) => ({
    primaryIds: JSON.parse(r.primaryChoices) as number[],
    secondaryIds: JSON.parse(r.secondaryChoices) as number[],
  }));
}

export async function issueBallotCode(
  code: string,
  emailHash: string,
): Promise<void> {
  const db = getDb();
  const { ballotCodes } = getSchemaTables();
  await db.insert(ballotCodes).values({ code, emailHash });
}
