"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { MAX_PRIMARY, MAX_SECONDARY, MAX_TOTAL } from "@/lib/voting";
import { TurnstileWidget } from "./TurnstileWidget";

export type CandidateView = {
  id: number;
  category: "primary" | "secondary";
  nameEn: string;
  nameZh: string;
};

type Props = {
  locale: Locale;
  candidates: CandidateView[];
  turnstileSiteKey: string;
  turnstileBypassDev: boolean;
  initialCode?: string;
};

export function VoteForm({
  locale,
  candidates,
  turnstileSiteKey,
  turnstileBypassDev,
  initialCode = "",
}: Props) {
  const [step, setStep] = useState<"claim" | "ballot" | "done">("claim");
  const [code, setCode] = useState(initialCode);
  const [token, setToken] = useState<string | null>(null);
  const [primary, setPrimary] = useState<number[]>([]);
  const [secondary, setSecondary] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const primaryCandidates = candidates.filter((c) => c.category === "primary");
  const secondaryCandidates = candidates.filter((c) => c.category === "secondary");

  const total = primary.length + secondary.length;
  const canSubmit =
    step === "ballot" &&
    total <= MAX_TOTAL &&
    primary.length <= MAX_PRIMARY &&
    secondary.length <= MAX_SECONDARY;

  const name = (c: CandidateView) => (locale === "zh-Hant" ? c.nameZh : c.nameEn);

  async function claimCode(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, turnstileToken: token }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error ?? t(locale, "error.invalidCode"));
      return;
    }
    setStep("ballot");
  }

  function toggle(id: number, category: "primary" | "secondary") {
    if (category === "primary") {
      setPrimary((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSecondary((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  }

  async function submitBallot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryIds: primary, secondaryIds: secondary }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error ?? "Submit failed");
      return;
    }
    setStep("done");
  }

  const limitsHint = useMemo(
    () =>
      locale === "zh-Hant"
        ? `已選：正選 ${primary.length}/${MAX_PRIMARY}，候選 ${secondary.length}/${MAX_SECONDARY}，合共 ${total}/${MAX_TOTAL}`
        : `Selected: primary ${primary.length}/${MAX_PRIMARY}, secondary ${secondary.length}/${MAX_SECONDARY}, total ${total}/${MAX_TOTAL}`,
    [locale, primary.length, secondary.length, total],
  );

  if (step === "done") {
    return <p className="success">{t(locale, "vote.success")}</p>;
  }

  if (step === "claim") {
    return (
      <form onSubmit={claimCode}>
        <h2>{t(locale, "vote.title")}</h2>
        <label htmlFor="code">{t(locale, "vote.code")}</label>
        <input
          id="code"
          type="text"
          maxLength={4}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
        />
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          bypassDev={turnstileBypassDev}
          onToken={setToken}
        />
        <button type="submit" disabled={!token || loading}>
          Continue
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submitBallot}>
      <h2>{t(locale, "vote.title")}</h2>
      <p className="subtitle">{t(locale, "vote.totalHint")}</p>
      <p>{limitsHint}</p>

      <h3>{t(locale, "vote.primary")}</h3>
      <ul className="candidate-list">
        {primaryCandidates.map((c) => (
          <li key={c.id}>
            <label>
              <input
                type="checkbox"
                checked={primary.includes(c.id)}
                onChange={() => toggle(c.id, "primary")}
                disabled={
                  !primary.includes(c.id) &&
                  (primary.length >= MAX_PRIMARY || total >= MAX_TOTAL)
                }
              />
              {name(c)}
            </label>
          </li>
        ))}
      </ul>

      <h3>{t(locale, "vote.secondary")}</h3>
      <ul className="candidate-list">
        {secondaryCandidates.map((c) => (
          <li key={c.id}>
            <label>
              <input
                type="checkbox"
                checked={secondary.includes(c.id)}
                onChange={() => toggle(c.id, "secondary")}
                disabled={
                  !secondary.includes(c.id) &&
                  (secondary.length >= MAX_SECONDARY || total >= MAX_TOTAL)
                }
              />
              {name(c)}
            </label>
          </li>
        ))}
      </ul>

      <button type="submit" disabled={!canSubmit || loading}>
        {t(locale, "vote.submit")}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
