"use client";

import { useEffect } from "react";
import AOS from "aos";

/**
 * Initializes AOS (Animate On Scroll) library once on client mount.
 * Respects the OS-level `prefers-reduced-motion` setting — AOS is fully
 * disabled when the user has opted for reduced motion, improving accessibility
 * and battery life on motion-sensitive devices.
 */
export function AosInitializer() {
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
      // Disable all AOS animations for users who prefer reduced motion
      disable: reduceMotion,
    });
  }, []);

  return null;
}
