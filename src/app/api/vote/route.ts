import { NextResponse } from "next/server";
import { z } from "zod";
import { submitAnonymousBallot } from "@/lib/ballot-submit";
import { getActiveCandidates, getElectionOpen } from "@/lib/election";
import { getVoterSession } from "@/lib/session";
import { validateSelections } from "@/lib/voting";

const bodySchema = z.object({
  primaryIds: z.array(z.number().int().positive()),
  secondaryIds: z.array(z.number().int().positive()),
});

export async function POST(req: Request) {
  const session = await getVoterSession();
  if (!session.ballotSessionId) {
    return NextResponse.json({ ok: false, error: "No active ballot session" }, { status: 401 });
  }

  if (!(await getElectionOpen())) {
    return NextResponse.json({ ok: false, error: "Election closed" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const candidates = await getActiveCandidates();
  const primaryIds = new Set(
    candidates.filter((c) => c.category === "primary").map((c) => c.id),
  );
  const secondaryIds = new Set(
    candidates.filter((c) => c.category === "secondary").map((c) => c.id),
  );

  const validation = validateSelections(
    { primaryIds: parsed.data.primaryIds, secondaryIds: parsed.data.secondaryIds },
    primaryIds,
    secondaryIds,
  );
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const result = await submitAnonymousBallot(session.ballotSessionId, {
    primaryIds: parsed.data.primaryIds,
    secondaryIds: parsed.data.secondaryIds,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Ballot already submitted" }, { status: 400 });
  }

  session.ballotSessionId = undefined;
  await session.save();

  return NextResponse.json({ ok: true });
}
