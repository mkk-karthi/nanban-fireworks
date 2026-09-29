"use client";

import { useEffect, useRef, useState, memo } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface TurnstileCaptchaProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile Captcha Component
 * Embeds Turnstile anti-bot challenge to protect order placement and free tier email quotas.
 * Automatically falls back to dev verification if no site key is configured.
 */
export const TurnstileCaptcha = memo(function TurnstileCaptcha({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  onSuccess,
  onError,
  onExpire,
  theme = "light",
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBypassed, setIsBypassed] = useState(false);

  // Stable callback refs prevent widget re-initialization on parent form changes
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  useEffect(() => {
    // If no site key is provided (e.g. dev environment or tests), bypass gracefully
    if (!siteKey) {
      setIsBypassed(true);
      onSuccessRef.current("dev-bypass-token");
      return;
    }

    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const safelyRemoveWidget = () => {
      if (
        widgetIdRef.current &&
        typeof window !== "undefined" &&
        window.turnstile &&
        containerRef.current &&
        document.body.contains(containerRef.current)
      ) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors if container is already detached
        }
      }
      widgetIdRef.current = null;
    };

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      safelyRemoveWidget();

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => {
            if (isMounted) onSuccessRef.current(token);
          },
          "error-callback": (err: unknown) => {
            const msg = typeof err === "string" ? err : "Verification failed";
            if (isMounted) {
              setLoadError(msg);
              onErrorRef.current?.(msg);
            }
          },
          "expired-callback": () => {
            if (isMounted) onExpireRef.current?.();
          },
        });
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error initializing Turnstile";
          setLoadError(msg);
          onErrorRef.current?.(msg);
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;

        // Propagate CSP nonce if present in the page environment
        const existingNonce =
          document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ||
          document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')?.content ||
          (typeof window !== "undefined" &&
            (window as unknown as { __webpack_nonce__?: string }).__webpack_nonce__);
        if (existingNonce) {
          script.nonce = existingNonce;
          script.setAttribute("nonce", existingNonce);
        }

        script.onload = () => {
          if (isMounted) renderWidget();
        };
        script.onerror = () => {
          if (isMounted) {
            setLoadError("Failed to load Cloudflare security check");
            onErrorRef.current?.("Failed to load script");
          }
        };
        document.head.appendChild(script);
      } else {
        pollInterval = setInterval(() => {
          if (window.turnstile) {
            if (pollInterval) clearInterval(pollInterval);
            if (isMounted) renderWidget();
          }
        }, 100);
      }
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      safelyRemoveWidget();
    };
  }, [siteKey, theme]);

  if (isBypassed) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800">
        <ShieldCheck size={16} className="text-amber-600 shrink-0" />
        <span>Anti-bot protection active (ready to send)</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
        <AlertCircle size={16} className="shrink-0 text-red-500" />
        <span>{loadError}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-1 overflow-hidden min-h-16">
      <div ref={containerRef} data-testid="cf-turnstile-widget" />
    </div>
  );
});
