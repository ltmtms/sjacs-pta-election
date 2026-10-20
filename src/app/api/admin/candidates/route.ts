import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, getSchemaTables } from "@/db";
import { getAdminSession } from "@/lib/session";

const bodySchema = z.object({
  category: z.enum(["primary", "secondary"]),
  nameEn: z.string().min(1),
  nameZh: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

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
  const { candidates } = getSchemaTables();
  await db.insert(candidates).values({
    category: parsed.data.category,
    nameEn: parsed.data.nameEn,
    nameZh: parsed.data.nameZh,
    sortOrder: parsed.data.sortOrder ?? 0,
    active: true,
  });

  return NextResponse.json({ ok: true });
}
