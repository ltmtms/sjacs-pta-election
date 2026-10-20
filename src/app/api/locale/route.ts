import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/i18n";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = parseLocale(url.searchParams.get("lang"));
  const jar = await cookies();
  jar.set("sjacs_locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  const redirect = url.searchParams.get("redirect") ?? "/";
  return NextResponse.redirect(new URL(redirect, url.origin));
}
