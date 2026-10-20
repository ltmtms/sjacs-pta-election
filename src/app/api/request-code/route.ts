import { NextResponse } from "next/server";
import { z } from "zod";
import { generateBallotCode, isValidCodeFormat } from "@/lib/codes";
import { getElectionOpen, issueBallotCode } from "@/lib/election";
import { sendBallotCodeEmail } from "@/lib/email";
import { hashEmail } from "@/lib/hash";
import { parseLocale, type Locale } from "@/lib/i18n";
import { verifyTurnstile } from "@/lib/turnstile";
import { getDb, getSchemaTables } from "@/db";
import { eq } from "drizzle-orm";

const bodySchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().min(1),
  locale: z.string().optional(),
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

  const email = parsed.data.email.trim().toLowerCase();
  const emailHash = hashEmail(email);
  const locale = parseLocale(parsed.data.locale) as Locale;

  const db = getDb();
  const { ballotCodes } = getSchemaTables();
  const existing = await db
    .select()
    .from(ballotCodes)
    .where(eq(ballotCodes.emailHash, emailHash))
    .limit(1);

  if (existing[0]) {
    return NextResponse.json({ ok: true });
  }

  let code = generateBallotCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    if (!isValidCodeFormat(code)) {
      code = generateBallotCode();
      continue;
    }
    try {
      await issueBallotCode(code, emailHash);
      break;
    } catch {
      code = generateBallotCode();
    }
  }

  await sendBallotCodeEmail({ to: email, code, locale });
  return NextResponse.json({ ok: true });
}
