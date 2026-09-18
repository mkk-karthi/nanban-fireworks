"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, PackageSearch, Sparkles, Check } from "lucide-react";
import type { Product, FilterState } from "../../_lib/types";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { useInfiniteScroll } from "../../_hooks/useInfiniteScroll";

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
        p.category.some(
          (c) => c.toLowerCase() === filters.category.toLowerCase()
        )
      );
    }

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.some((c) => c.toLowerCase().includes(q))
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
      case "discount-desc":
        result.sort(
          (a, b) =>
            (b.actualPrice - b.discountedPrice) / b.actualPrice -
            (a.actualPrice - a.discountedPrice) / a.actualPrice
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, filters]);

  // Infinite scroll with lazy loading
  const { visibleItems, sentinelRef, hasMore, isLoadingMore } =
    useInfiniteScroll(filteredProducts, 20);

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => setFilters(newFilters),
    []
  );

  return (
    <section id="products" className="scroll-mt-14">
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
            <Sparkles className="size-7 text-red-600 shrink-0" strokeWidth={2.5} />
            <span>All <span className="text-red-600">Crackers & Fireworks</span></span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {visibleItems.length} of {filteredProducts.length} products · 100% Sivakasi Standard
          </p>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <PackageSearch size={54} strokeWidth={1.2} />
            <p className="text-base font-bold text-gray-700">No products found</p>
            <p className="text-xs text-gray-500">Try selecting a different category or clearing search terms.</p>
          </div>
        )}

        {/* Product Grid: Enforces uniform height across all columns and rows */}
        {visibleItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
            {visibleItems.map((product, i) => (
              <div key={product.id} className="h-full flex flex-col">
                <ProductCard
                  product={product}
                  priority={i < 4}
                />
              </div>
            ))}

            {/* Skeleton placeholders during progressive lazy load */}
            {isLoadingMore &&
              [...Array(5)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white rounded-2xl p-3 border border-amber-100 animate-pulse flex flex-col h-full justify-between gap-3 shadow-sm"
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
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-amber-200 text-red-600 text-xs font-bold shadow-sm animate-pulse">
              <Loader2 size={16} className="animate-spin text-red-600" />
              <span>Loading more fireworks...</span>
            </div>
          )}

          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-center py-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Check size={14} className="text-green-700" strokeWidth={2.5} />
                <span>All {filteredProducts.length} products loaded</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
