import { RequestCodeForm } from "@/components/RequestCodeForm";
import { SiteHeader } from "@/components/SiteHeader";
import { resolveLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import { getPublicEnv } from "@/lib/env";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await resolveLocale(sp.lang);
  const publicEnv = getPublicEnv();
  const langQ = `?lang=${locale}`;

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <div className="card">
          <h1>{t(locale, "site.title")}</h1>
          <p className="subtitle">{t(locale, "site.subtitle")}</p>
          <RequestCodeForm
            locale={locale}
            turnstileSiteKey={publicEnv.turnstileSiteKey}
            turnstileBypassDev={publicEnv.turnstileBypassDev}
          />
          <p style={{ marginTop: "1.5rem" }}>
            <Link href={`/vote${langQ}`} className="btn">
              {t(locale, "home.haveCode")}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
