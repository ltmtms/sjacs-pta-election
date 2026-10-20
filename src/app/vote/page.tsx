import { VoteForm } from "@/components/VoteForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getElectionOpen, getActiveCandidates } from "@/lib/election";
import { resolveLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import { getPublicEnv } from "@/lib/env";

type Props = {
  searchParams: Promise<{ lang?: string; code?: string }>;
};

export default async function VotePage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await resolveLocale(sp.lang);
  const open = await getElectionOpen();
  const candidates = await getActiveCandidates();
  const publicEnv = getPublicEnv();

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <div className="card">
          {!open ? (
            <p className="error">{t(locale, "error.electionClosed")}</p>
          ) : (
            <VoteForm
              locale={locale}
              candidates={candidates.map((c) => ({
                id: c.id,
                category: c.category as "primary" | "secondary",
                nameEn: c.nameEn,
                nameZh: c.nameZh,
              }))}
              turnstileSiteKey={publicEnv.turnstileSiteKey}
              turnstileBypassDev={publicEnv.turnstileBypassDev}
              initialCode={sp.code ?? ""}
            />
          )}
        </div>
      </main>
    </>
  );
}
