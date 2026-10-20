import { getEnv } from "./env";

export type SendCodeEmailInput = {
  to: string;
  code: string;
  locale: "en" | "zh-Hant";
};

export async function sendBallotCodeEmail(input: SendCodeEmailInput): Promise<void> {
  const env = getEnv();
  const { to, code, locale } = input;

  const subject =
    locale === "zh-Hant"
      ? "SJACS 家長教師會選舉 — 投票代碼"
      : "SJACS PTA Election — Ballot Code";
  const body =
    locale === "zh-Hant"
      ? `您的 SJACS 家長教師會選舉投票代碼為：${code}\n\n請妥善保管，每人一票。`
      : `Your SJACS PTA election ballot code is: ${code}\n\nKeep it private — one vote per code.`;

  if (env.emailProvider === "stub") {
    console.info(`[email-stub] To: ${to}\nSubject: ${subject}\n${body}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SJACS PTA <noreply@sjacs.edu.hk>",
      to: [to],
      subject,
      text: body,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send email: ${text}`);
  }
}
