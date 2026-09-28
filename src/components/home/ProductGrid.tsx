"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, PackageSearch, Sparkles, Check } from "lucide-react";
import type { Product, FilterState } from "@/lib/types";
import { scrollToProducts } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface ProductGridProps {
  products: Product[];
}

/**
 * ProductGrid with uniform card heights across all rows,
 * lazy-loading infinite scroll with skeleton placeholders,
 * and AOS / Framer animations.
 */
export function ProductGrid({ products }: ProductGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    sort: "featured",
    search: "",
  });

  // Apply filters & sort (memoized)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filters.category !== "All") {
      result = result.filter((p) =>
        p.category.some((c) => c.toLowerCase() === filters.category.toLowerCase()),
      );
    }

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.some((c) => c.toLowerCase().includes(q)),
      );
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters]);

  // Infinite scroll with lazy loading
  const { visibleItems, sentinelRef, hasMore, isLoadingMore, loadMore } = useInfiniteScroll(
    filteredProducts,
    20,
  );

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters((prev) => {
      if (prev.category !== newFilters.category) {
        scrollToProducts();
      }
      return newFilters;
    });
  }, []);

  return (
    <section id="products" className="scroll-mt-28" role="tabpanel" aria-label="Product catalog">
      {/* Sticky filter bar */}
      <ProductFilters
        filters={filters}
        onChange={handleFiltersChange}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section heading with AOS animation */}
        <div data-aos="fade-right" data-aos-duration="600" className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles
              className="size-7 text-red-600 shrink-0"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span>
              All <span className="text-red-600">Crackers & Fireworks</span>
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1" aria-live="polite" aria-atomic="true">
            Showing {visibleItems.length} of {filteredProducts.length} products · 100% Sivakasi
            Standard
          </p>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400"
            role="status"
          >
            <PackageSearch size={54} strokeWidth={1.2} aria-hidden="true" />
            <p className="text-base font-bold text-gray-700">No products found</p>
            <p className="text-xs text-gray-500">
              Try selecting a different category or clearing search terms.
            </p>
          </div>
        )}

        {/* Product Grid: Enforces uniform height across all columns and rows */}
        {visibleItems.length > 0 && (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch"
            role="list"
            aria-label="Products"
          >
            {visibleItems.map((product) => (
              <div key={product.id} className="h-full flex flex-col" role="listitem">
                <ProductCard product={product} priority={false} />
              </div>
            ))}

            {/* Skeleton placeholders during progressive lazy load */}
            {isLoadingMore &&
              [...Array(5)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white rounded-2xl p-3 border border-amber-100 animate-pulse flex flex-col h-full justify-between gap-3 shadow-sm"
                  aria-hidden="true"
                >
                  <div className="aspect-square w-full bg-amber-100/70 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-amber-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                  </div>
                  <div className="h-8 bg-amber-100/60 rounded-xl mt-auto" />
                </div>
              ))}
          </div>
        )}

        {/* Infinite scroll sentinel & status indicators */}
        <div ref={sentinelRef} className="mt-10 flex flex-col items-center justify-center gap-2">
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-300 text-red-600 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
              aria-label="Load more Crackers"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin text-red-600" aria-hidden="true" />
                  <span>Loading more Crackers...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-500" aria-hidden="true" />
                  <span>
                    Load More Crackers ({filteredProducts.length - visibleItems.length} more)
                  </span>
                </>
              )}
            </button>
          )}

          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-center py-4" role="status">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Check size={14} className="text-green-700" strokeWidth={2.5} aria-hidden="true" />
                <span>All {filteredProducts.length} products loaded</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
