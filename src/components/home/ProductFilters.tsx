"use client";

import { memo, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, SORT_OPTIONS } from "@/config/site";
import { scrollToProducts } from "@/lib/utils";
import type { FilterState } from "@/lib/types";

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

/** Filter bar with category chips, sort dropdown, and search input. */
export const ProductFilters = memo(function ProductFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: ProductFiltersProps) {
  const setCategory = useCallback(
    (category: string) => {
      onChange({ ...filters, category });
      scrollToProducts();
    },
    [onChange, filters],
  );

  const setSort = useCallback(
    (sort: string) => onChange({ ...filters, sort }),
    [onChange, filters],
  );

  const setSearch = useCallback(
    (search: string) => onChange({ ...filters, search }),
    [onChange, filters],
  );

  return (
    <div
      className="bg-white border-b border-amber-100 shadow-xs sticky top-25 z-20 transition-all"
      role="search"
      aria-label="Product filters"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3">
        {/* Top row: search + sort + results count */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-35 max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search products…"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-amber-200 rounded-full
                bg-amber-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent
                placeholder:text-gray-400 text-gray-700"
              aria-label="Search products"
              id="product-search"
            />
          </div>

          {/* Results count */}
          <p
            className="text-xs text-gray-500 ml-auto hidden sm:block"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredCount === totalCount
              ? `${totalCount} products`
              : `${filteredCount} of ${totalCount} products`}
          </p>

          {/* Sort dropdown */}
          <div className="relative">
            <label htmlFor="product-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="product-sort"
              value={filters.sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-amber-200 rounded-full
                bg-amber-50 focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 overscroll-x-contain touch-pan-x"
          role="tablist"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                onClick={() => setCategory(cat)}
                aria-selected={isActive}
                aria-controls="products"
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                  border transition-all duration-200 whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-300"
                      : "bg-white text-gray-600 border-amber-200 hover:border-red-400 hover:text-red-600"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
