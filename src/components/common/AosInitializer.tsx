"use client";

import { useEffect } from "react";
import AOS from "aos";

/**
 * Initializes AOS (Animate On Scroll) library on client mount.
 * Defers initialization off the critical render path using requestIdleCallback.
 * Respects OS-level prefers-reduced-motion for accessibility.
 */
export function AosInitializer() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initAos = () => {
      AOS.init({
        duration: 650,
        easing: "ease-out-cubic",
        once: true,
        offset: 40,
        disable: prefersReducedMotion,
      });
    };

    if ("requestIdleCallback" in window) {
      const handle = (
        window as unknown as { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(initAos);
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
            handle,
          );
        }
      };
    }

    const timer = setTimeout(initAos, 60);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
