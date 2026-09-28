import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when modals / lightboxes are active.
 * Restores original overflow property on unmount or when lock is false.
 */
export function useScrollLock(lock: boolean = true): void {
  useEffect(() => {
    if (!lock) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [lock]);
}
