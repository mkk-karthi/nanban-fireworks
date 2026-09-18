import { useEffect, useRef, useState, useMemo } from "react";
import { PAGINATION } from "../_lib/constants";

/**
 * Enhanced infinite scroll hook with lazy loading state and intersection observer.
 */
export function useInfiniteScroll<T>(
  items: T[],
  pageSize: number = PAGINATION.productsPerPage
) {
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Slice visible items
  const visibleItems = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize]
  );

  const hasMore = visibleItems.length < items.length;

  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
    setIsLoadingMore(false);
  }

  // Observe sentinel element to trigger next page load
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setIsLoadingMore(true);
          // Small progressive throttle for smooth lazy loading animation
          const timer = setTimeout(() => {
            setPage((prev) => prev + 1);
            setIsLoadingMore(false);
          }, 300);
          return () => clearTimeout(timer);
        }
      },
      { rootMargin: "300px" }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoadingMore, visibleItems.length]);

  return { visibleItems, sentinelRef, hasMore, isLoadingMore };
}
