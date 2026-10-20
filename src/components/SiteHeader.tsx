import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  locale: Locale;
};

export function SiteHeader({ locale }: Props) {
  const langQ = `?lang=${locale}`;
  return (
    <header className="site-header">
      <div className="brand">SJACS</div>
      <nav>
        <Link href={`/${langQ}`}>{t(locale, "nav.home")}</Link>
        <Link href={`/vote${langQ}`}>{t(locale, "nav.vote")}</Link>
        <Link href={`/transparency${langQ}`}>{t(locale, "nav.transparency")}</Link>
        <Link href="/admin">Admin</Link>
        <LanguageSwitcher locale={locale} pathname="/" />
      </nav>
    </header>
  );
}
