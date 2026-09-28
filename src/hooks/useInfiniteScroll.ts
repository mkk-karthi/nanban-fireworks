import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { PAGINATION } from "@/config/site";

export function useInfiniteScroll<T>(items: T[], pageSize: number = PAGINATION.productsPerPage) {
  const [prevItems, setPrevItems] = useState(items);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // When items change (e.g. search/filter changed), adjust state during render
  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
  }

  // Slice visible items
  const visibleItems = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize]);

  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    setPage((prev) => (prev * pageSize < items.length ? prev + 1 : prev));
  }, [items.length, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  return {
    visibleItems,
    sentinelRef,
    hasMore,
    isLoadingMore: false,
    loadMore,
  };
}
