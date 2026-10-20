import { SiteHeader } from "@/components/SiteHeader";
import { buildTransparencyPayload } from "@/lib/transparency";
import {
  getAllBallotCodes,
  getElectionOpen,
  getTurnout,
} from "@/lib/election";
import { getEnv } from "@/lib/env";
import { resolveLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function TransparencyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await resolveLocale(sp.lang);
  const env = getEnv();
  const open = await getElectionOpen();
  const turnout = await getTurnout();
  const codes = await getAllBallotCodes();
  const payload = buildTransparencyPayload(
    env.transparencyCommitmentSecret,
    codes,
    turnout,
    open,
  );

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <div className="card">
          <h1>{t(locale, "transparency.title")}</h1>
          <p>
            <strong>{t(locale, "transparency.turnout")}:</strong> {payload.turnout}
          </p>
          <p>
            <strong>{t(locale, "transparency.root")}:</strong>
          </p>
          <p className="mono">{payload.commitmentRoot}</p>
          {payload.mode === "closed" && (
            <>
              <h2>{t(locale, "transparency.codes")}</h2>
              <p className="mono">{payload.codes.join(", ")}</p>
            </>
          )}
          {payload.mode === "open" && (
            <p className="subtitle">
              {locale === "zh-Hant"
                ? "選舉進行中：僅公布投票率與承諾根。"
                : "Election in progress: only turnout and commitment root are published."}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
