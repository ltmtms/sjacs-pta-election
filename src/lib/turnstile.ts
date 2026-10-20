import { getEnv } from "./env";

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  const env = getEnv();
  if (env.turnstileBypassDev) {
    return true;
  }
  if (!token) return false;
  if (!env.turnstileSecretKey) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env.turnstileSecretKey,
      response: token,
    }),
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}
