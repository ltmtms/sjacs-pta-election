import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Props = {
  locale: Locale;
  pathname: string;
};

export function LanguageSwitcher({ locale, pathname }: Props) {
  const locales: { code: Locale; label: string }[] = [
    { code: "zh-Hant", label: t(locale, "lang.zh") },
    { code: "en", label: t(locale, "lang.en") },
  ];

  return (
    <div className="lang-switch" role="navigation" aria-label="Language">
      {locales.map((l) => (
        <Link
          key={l.code}
          href={`${pathname}?lang=${l.code}`}
          className={locale === l.code ? "active" : undefined}
          hrefLang={l.code}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
