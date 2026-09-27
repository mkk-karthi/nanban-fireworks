import { useEffect, useRef, useState, useMemo } from "react";
import { PAGINATION } from "@/config/site";

/**
 * Enhanced infinite scroll hook with lazy loading state and intersection observer.
 *
 * Optimizations:
 * - Direct render-time state adjustment when `items` reference changes (standard React pattern).
 * - Observer is disconnected on cleanup.
 * - Timer is properly tracked and cleared on unmount/re-run.
 */
export function useInfiniteScroll<T>(
  items: T[],
  pageSize: number = PAGINATION.productsPerPage
) {
  const [prevItems, setPrevItems] = useState(items);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // When items change (e.g. search/filter changed), adjust state during render
  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
    setIsLoadingMore(false);
  }

  // Slice visible items
  const visibleItems = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize]
  );

  const hasMore = visibleItems.length < items.length;

  // Observe sentinel element to trigger next page load
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setIsLoadingMore(true);
          timer = setTimeout(() => {
            setPage((prev) => prev + 1);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "300px" }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, visibleItems.length]);

  return {
    visibleItems,
    sentinelRef,
    hasMore,
    isLoadingMore,
  };
}
