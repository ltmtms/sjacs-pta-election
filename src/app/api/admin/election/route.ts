import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, getSchemaTables } from "@/db";
import { getAdminSession } from "@/lib/session";
import { eq } from "drizzle-orm";

const bodySchema = z.object({ isOpen: z.boolean() });

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = getDb();
  const { electionSettings } = getSchemaTables();
  const rows = await db.select().from(electionSettings).limit(1);
  const id = rows[0]?.id ?? 1;
  await db
    .update(electionSettings)
    .set({ isOpen: parsed.data.isOpen, updatedAt: new Date().toISOString() })
    .where(eq(electionSettings.id, id));

  return NextResponse.json({ ok: true });
}
