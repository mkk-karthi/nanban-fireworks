"use client";

import { useEffect } from "react";
import AOS from "aos";

/**
 * Initializes AOS (Animate On Scroll) library once on client mount.
 */
export function AosInitializer() {
  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  return null;
}
