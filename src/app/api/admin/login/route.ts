import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { getAdminSession } from "@/lib/session";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const env = getEnv();
  if (parsed.data.password !== env.adminPassword) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await getAdminSession();
  session.admin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
