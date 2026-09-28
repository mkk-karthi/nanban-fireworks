import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Custom hook to safely check if component has mounted on client.
 * Uses useSyncExternalStore for hydration safety.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
