"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { TurnstileWidget } from "./TurnstileWidget";

type Props = {
  locale: Locale;
  turnstileSiteKey: string;
  turnstileBypassDev: boolean;
};

export function RequestCodeForm({ locale, turnstileSiteKey, turnstileBypassDev }: Props) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, turnstileToken: token, locale }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setStatus("error");
      setMessage(data.error ?? "Request failed");
      return;
    }
    setStatus("ok");
    setMessage(
      locale === "zh-Hant"
        ? "如電郵有效，您將收到投票代碼。"
        : "If your email is eligible, you will receive a ballot code shortly.",
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>{t(locale, "home.requestCode")}</h2>
      <label htmlFor="email">{t(locale, "home.email")}</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <TurnstileWidget
        siteKey={turnstileSiteKey}
        bypassDev={turnstileBypassDev}
        onToken={setToken}
      />
      <button type="submit" disabled={!token || status === "loading"}>
        {t(locale, "home.submit")}
      </button>
      {status === "error" && <p className="error">{message}</p>}
      {status === "ok" && <p className="success">{message}</p>}
    </form>
  );
}
