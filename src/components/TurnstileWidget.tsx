"use client";

import { useEffect, useRef } from "react";

type Props = {
  siteKey: string;
  bypassDev: boolean;
  onToken: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          theme?: string;
        },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

export function TurnstileWidget({ siteKey, bypassDev, onToken }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (bypassDev) {
      onToken("dev-bypass");
      return;
    }
    if (!siteKey || !ref.current) return;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (!ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token) => onToken(token),
      });
    };
    document.body.appendChild(script);

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
      script.remove();
    };
  }, [siteKey, bypassDev, onToken]);

  if (bypassDev) {
    return (
      <p className="subtitle" data-testid="turnstile-bypass">
        DEV: Turnstile bypass active (TURNSTILE_BYPASS_DEV=true)
      </p>
    );
  }

  if (!siteKey) {
    return <p className="error">Turnstile site key not configured</p>;
  }

  return <div ref={ref} />;
}
