import { NextResponse } from "next/server";
import { z } from "zod";
import { claimBallotCode } from "@/lib/ballot-claim";
import { getElectionOpen } from "@/lib/election";
import { getVoterSession } from "@/lib/session";
import { verifyTurnstile } from "@/lib/turnstile";

const bodySchema = z.object({
  code: z.string().min(4).max(4),
  turnstileToken: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
    return NextResponse.json({ ok: false, error: "Turnstile failed" }, { status: 403 });
  }

  if (!(await getElectionOpen())) {
    return NextResponse.json({ ok: false, error: "Election closed" }, { status: 403 });
  }

  const result = await claimBallotCode(parsed.data.code);
  if (!result.ok) {
    const error =
      result.reason === "already_claimed"
        ? "This code has already been used"
        : "Invalid or unknown ballot code";
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const session = await getVoterSession();
  session.ballotSessionId = result.ballotSessionId;
  await session.save();

  return NextResponse.json({ ok: true });
}
