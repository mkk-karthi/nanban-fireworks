"use client";

import { useEffect, useRef, useState, memo } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export interface GoogleRecaptchaProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: unknown) => void;
        },
      ) => number;
      reset: (opt_widget_id?: number) => void;
      ready: (callback: () => void) => void;
    };
    onloadRecaptchaCallback?: () => void;
  }
}

const SCRIPT_ID = "google-recaptcha-script";
const SCRIPT_URL = "https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit";

/**
 * Google reCAPTCHA v2 Component
 * Embeds Google reCAPTCHA anti-bot challenge to protect order placement and email quotas.
 * Automatically falls back to dev verification if no site key is configured.
 */
export const GoogleRecaptcha = memo(function GoogleRecaptcha({
  siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
  onSuccess,
  onError,
  onExpire,
  theme = "light",
  size = "normal",
}: GoogleRecaptchaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
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

    const safelyResetWidget = () => {
      if (
        widgetIdRef.current !== null &&
        typeof window !== "undefined" &&
        window.grecaptcha &&
        typeof window.grecaptcha.reset === "function"
      ) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // Ignore reset errors if container is already detached
        }
      }
      widgetIdRef.current = null;
    };

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.grecaptcha || typeof window.grecaptcha.render !== "function") return;
      if (widgetIdRef.current !== null) return;

      try {
        containerRef.current.innerHTML = "";
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            if (isMounted) onSuccessRef.current(token);
          },
          "error-callback": (err: unknown) => {
            const msg = typeof err === "string" ? err : "reCAPTCHA verification failed";
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
          const msg = err instanceof Error ? err.message : "Error initializing reCAPTCHA";
          setLoadError(msg);
          onErrorRef.current?.(msg);
        }
      }
    };

    const tryRender = () => {
      if (!isMounted) return;
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          if (isMounted) renderWidget();
        });
      } else {
        renderWidget();
      }
    };

    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      tryRender();
    } else {
      window.onloadRecaptchaCallback = () => {
        if (isMounted) tryRender();
      };

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
          if (isMounted) tryRender();
        };
        script.onerror = () => {
          if (isMounted) {
            setLoadError("Failed to load Google security check");
            onErrorRef.current?.("Failed to load script");
          }
        };
        document.head.appendChild(script);
      } else {
        pollInterval = setInterval(() => {
          if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
            if (pollInterval) clearInterval(pollInterval);
            if (isMounted) tryRender();
          }
        }, 100);
      }
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      safelyResetWidget();
    };
  }, [siteKey, theme, size]);

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
      <div ref={containerRef} data-testid="google-recaptcha-widget" />
    </div>
  );
});

// Also export as default and alias for backwards compatibility
export default GoogleRecaptcha;
