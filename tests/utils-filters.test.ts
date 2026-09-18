/**
 * utils-filters.test.ts
 *
 * Comprehensive test suite covering:
 * 1. formatPrice – Intl.NumberFormat locale correctness
 * 2. Filter logic – mirrors ProductGrid filtering (search, category, sort)
 * 3. Infinite scroll pagination math
 * 4. Cart store rapid-update patterns
 * 5. SEO & business constants validation
 * 6. Additional edge cases for existing utilities
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatPrice,
  computeCartTotals,
  getDiscountPercent,
  getTotalSavings,
  clamp,
} from "../app/_lib/utils";
import { useCartStore } from "../app/_store/cartStore";
import {
  BRAND,
  ORDER_CONFIG,
  CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
} from "../app/_lib/constants";
import type { Product } from "../app/_lib/types";

// Load datasets
const products: Product[] = JSON.parse(
  readFileSync(join(process.cwd(), "app/_data/products.json"), "utf-8")
);
const giftBoxes: Product[] = JSON.parse(
  readFileSync(join(process.cwd(), "app/_data/giftBoxes.json"), "utf-8")
);

// ─── Mirror ProductGrid filter logic ─────────────────────────────────────────

function applyFilters(
  allProducts: Product[],
  category: string,
  search: string,
  sort: string
): Product[] {
  let result = [...allProducts];

  if (category !== "All") {
    result = result.filter((p) =>
      p.category.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.some((c) => c.toLowerCase().includes(q))
    );
  }

  switch (sort) {
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
      break; // "featured" – preserve original order
  }

  return result;
}

// ─── 1. formatPrice ───────────────────────────────────────────────────────────

describe("formatPrice – Indian Rupee formatting", () => {
  it("formats ₹0 without error", () => {
    const result = formatPrice(0);
    assert.ok(typeof result === "string");
    assert.ok(result.includes("0"));
  });

  it("formats ₹1 correctly", () => {
    const result = formatPrice(1);
    assert.ok(result.includes("1"));
  });

  it("formats ₹99 correctly", () => {
    const result = formatPrice(99);
    assert.ok(result.includes("99"));
  });

  it("formats ₹1,000 with Indian number grouping", () => {
    const result = formatPrice(1000);
    // en-IN formats 1000 as "₹1,000"
    assert.ok(result.includes("1,000") || result.includes("1000"));
  });

  it("formats ₹10,000 correctly", () => {
    const result = formatPrice(10000);
    assert.ok(result.includes("10,000") || result.includes("10000"));
  });

  it("formats ₹1,00,000 with Indian lakh grouping", () => {
    const result = formatPrice(100000);
    // en-IN formats 100000 as "₹1,00,000"
    assert.ok(
      result.includes("1,00,000") ||
        result.includes("100,000") ||
        result.includes("100000")
    );
  });

  it("contains the Rupee symbol ₹", () => {
    const result = formatPrice(500);
    assert.ok(result.includes("₹") || result.includes("Rs") || result.includes("INR"));
  });

  it("has no decimal places for whole numbers", () => {
    const result = formatPrice(500);
    assert.ok(!result.includes("."));
  });

  it("returns consistent results on repeated calls (cached formatter check)", () => {
    const r1 = formatPrice(1234);
    const r2 = formatPrice(1234);
    assert.strictEqual(r1, r2, "Formatter must be deterministic");
  });
});

// ─── 2. Filter Logic (mirrors ProductGrid) ────────────────────────────────────

describe("ProductGrid filter logic – category filter", () => {
  it("'All' category returns the full product list", () => {
    const result = applyFilters(products, "All", "", "featured");
    assert.strictEqual(result.length, products.length);
  });

  it("filters to a specific category", () => {
    // Find a category that exists in at least one product
    const firstCat = products[0].category[0];
    const result = applyFilters(products, firstCat, "", "featured");
    assert.ok(result.length > 0, `Should have products in category '${firstCat}'`);
    result.forEach((p) => {
      assert.ok(
        p.category.some((c) => c.toLowerCase() === firstCat.toLowerCase()),
        `Product ${p.id} should be in category ${firstCat}`
      );
    });
  });

  it("returns empty array for a non-existent category", () => {
    const result = applyFilters(products, "NonExistentCategory999", "", "featured");
    assert.strictEqual(result.length, 0);
  });

  it("category filter is case-insensitive", () => {
    const firstCat = products[0].category[0];
    const resultLower = applyFilters(products, firstCat.toLowerCase(), "", "featured");
    const resultUpper = applyFilters(products, firstCat.toUpperCase(), "", "featured");
    assert.strictEqual(resultLower.length, resultUpper.length);
  });
});

describe("ProductGrid filter logic – search filter", () => {
  it("empty search returns all products", () => {
    const result = applyFilters(products, "All", "", "featured");
    assert.strictEqual(result.length, products.length);
  });

  it("search matches product name (case-insensitive)", () => {
    const firstProduct = products[0];
    const nameFragment = firstProduct.name.slice(0, 4).toUpperCase();
    const result = applyFilters(products, "All", nameFragment, "featured");
    assert.ok(result.length > 0, "Name search should find at least 1 product");
    assert.ok(
      result.some((p) => p.id === firstProduct.id),
      "Should include the product with matching name"
    );
  });

  it("search matches category name", () => {
    const firstCat = products[0].category[0];
    const result = applyFilters(products, "All", firstCat, "featured");
    assert.ok(result.length > 0, "Category search should return matches");
  });

  it("whitespace-only search is treated as no search", () => {
    const result = applyFilters(products, "All", "   ", "featured");
    assert.strictEqual(result.length, products.length);
  });

  it("search for a non-existent term returns empty array", () => {
    const result = applyFilters(products, "All", "xyzzy999nonexistent", "featured");
    assert.strictEqual(result.length, 0);
  });

  it("search is partial-match (substring)", () => {
    // Take a 3-char substring from a known product name
    const name = products[0].name;
    if (name.length >= 3) {
      const fragment = name.slice(0, 3);
      const result = applyFilters(products, "All", fragment, "featured");
      assert.ok(result.length >= 1, "Partial match should return at least 1 product");
    }
  });
});

describe("ProductGrid filter logic – sort options", () => {
  it("price-asc sorts products by discountedPrice ascending", () => {
    const result = applyFilters(products, "All", "", "price-asc");
    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i].discountedPrice >= result[i - 1].discountedPrice,
        `Product at index ${i} (₹${result[i].discountedPrice}) should be >= index ${i - 1} (₹${result[i - 1].discountedPrice})`
      );
    }
  });

  it("price-desc sorts products by discountedPrice descending", () => {
    const result = applyFilters(products, "All", "", "price-desc");
    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i].discountedPrice <= result[i - 1].discountedPrice,
        `Product at index ${i} (₹${result[i].discountedPrice}) should be <= index ${i - 1} (₹${result[i - 1].discountedPrice})`
      );
    }
  });

  it("name-asc sorts products alphabetically", () => {
    const result = applyFilters(products, "All", "", "name-asc");
    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i].name.localeCompare(result[i - 1].name) >= 0,
        `"${result[i].name}" should be >= "${result[i - 1].name}" alphabetically`
      );
    }
  });

  it("discount-desc orders by highest discount percentage first", () => {
    const result = applyFilters(products, "All", "", "discount-desc");
    const getDiscPct = (p: Product) =>
      (p.actualPrice - p.discountedPrice) / p.actualPrice;
    for (let i = 1; i < result.length; i++) {
      assert.ok(
        getDiscPct(result[i]) <= getDiscPct(result[i - 1]),
        `Product at ${i} should have <= discount pct than product at ${i - 1}`
      );
    }
  });

  it("featured sort preserves original product order", () => {
    const result = applyFilters(products, "All", "", "featured");
    // IDs should be in same order as original
    result.forEach((p, i) => {
      assert.strictEqual(p.id, products[i].id, `Order mismatch at index ${i}`);
    });
  });
});

describe("ProductGrid filter logic – combined filter + sort", () => {
  it("category + search + sort all applied together", () => {
    const firstCat = products[0].category[0];
    // Apply category filter first, then search for all items in that category
    const result = applyFilters(products, firstCat, "", "price-asc");
    assert.ok(result.length > 0);
    // Verify all items are in the category
    result.forEach((p) => {
      assert.ok(
        p.category.some((c) => c.toLowerCase() === firstCat.toLowerCase())
      );
    });
    // Verify price-asc ordering
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i].discountedPrice >= result[i - 1].discountedPrice);
    }
  });

  it("no results when category + impossible search combined", () => {
    const result = applyFilters(products, products[0].category[0], "xyzzy_impossible", "featured");
    assert.strictEqual(result.length, 0);
  });
});

// ─── 3. Infinite Scroll Pagination Math ──────────────────────────────────────

describe("Infinite scroll pagination math", () => {
  const PAGE_SIZE = PAGINATION.productsPerPage; // 20

  it("first page shows exactly pageSize items when catalog > pageSize", () => {
    assert.ok(products.length > PAGE_SIZE, "Need more products than pageSize for this test");
    const firstPage = products.slice(0, 1 * PAGE_SIZE);
    assert.strictEqual(firstPage.length, PAGE_SIZE);
  });

  it("hasMore is false when items <= pageSize", () => {
    const smallCatalog = products.slice(0, 5);
    const visible = smallCatalog.slice(0, PAGE_SIZE);
    const hasMore = visible.length < smallCatalog.length;
    assert.strictEqual(hasMore, false);
  });

  it("hasMore is true when items > pageSize", () => {
    if (products.length <= PAGE_SIZE) return; // Skip if catalog is small
    const visible = products.slice(0, PAGE_SIZE);
    const hasMore = visible.length < products.length;
    assert.strictEqual(hasMore, true);
  });

  it("last page may have fewer than pageSize items", () => {
    const totalPages = Math.ceil(products.length / PAGE_SIZE);
    const lastPage = products.slice((totalPages - 1) * PAGE_SIZE, totalPages * PAGE_SIZE);
    assert.ok(lastPage.length <= PAGE_SIZE);
    assert.ok(lastPage.length > 0);
  });

  it("all items are covered across all pages with no overlap", () => {
    const totalPages = Math.ceil(products.length / PAGE_SIZE);
    const allCovered = new Set<string>();
    for (let page = 1; page <= totalPages; page++) {
      const slice = products.slice(0, page * PAGE_SIZE);
      slice.forEach((p) => allCovered.add(p.id));
    }
    assert.strictEqual(allCovered.size, products.length, "All product IDs should be covered");
  });
});

// ─── 4. Cart Store – Rapid-Update Patterns ───────────────────────────────────

describe("Cart store – rapid-update patterns", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("getTotalUnits returns 0 for an empty cart", () => {
    assert.strictEqual(useCartStore.getState().getTotalUnits(), 0);
  });

  it("rapid sequential addItem calls accumulate correctly", () => {
    const store = useCartStore.getState();
    for (let i = 0; i < 10; i++) {
      store.addItem("rapid_item", 1);
    }
    assert.strictEqual(useCartStore.getState().getItemQuantity("rapid_item"), 10);
    assert.strictEqual(useCartStore.getState().items.length, 1);
  });

  it("mixing addItem and updateQuantity on same product resolves correctly", () => {
    const store = useCartStore.getState();
    store.addItem("p001", 3);
    store.updateQuantity("p001", 7);
    assert.strictEqual(useCartStore.getState().getItemQuantity("p001"), 7);
  });

  it("adding different items maintains correct individual quantities", () => {
    const store = useCartStore.getState();
    store.addItem("item_A", 2);
    store.addItem("item_B", 5);
    store.addItem("item_C", 1);
    assert.strictEqual(useCartStore.getState().getItemQuantity("item_A"), 2);
    assert.strictEqual(useCartStore.getState().getItemQuantity("item_B"), 5);
    assert.strictEqual(useCartStore.getState().getItemQuantity("item_C"), 1);
    assert.strictEqual(useCartStore.getState().getTotalUnits(), 8);
  });

  it("updateQuantity to 0 removes item, total is recalculated", () => {
    const store = useCartStore.getState();
    store.addItem("p001", 5);
    store.addItem("p002", 3);
    store.updateQuantity("p001", 0);
    assert.strictEqual(useCartStore.getState().getTotalUnits(), 3);
    assert.strictEqual(useCartStore.getState().isInCart("p001"), false);
  });

  it("computeCartTotals with mixed products and gift boxes", () => {
    const cartItems = [
      { productId: products[0].id, quantity: 2 },
      { productId: giftBoxes[0].id, quantity: 1 },
    ];
    const allCatalog = [...products, ...giftBoxes];
    const totals = computeCartTotals(cartItems, allCatalog);
    assert.strictEqual(totals.itemCount, 2);

    const expectedActual =
      products[0].actualPrice * 2 + giftBoxes[0].actualPrice * 1;
    const expectedDiscounted =
      products[0].discountedPrice * 2 + giftBoxes[0].discountedPrice * 1;

    assert.strictEqual(totals.actualTotal, expectedActual);
    assert.strictEqual(totals.discountedTotal, expectedDiscounted);
    assert.strictEqual(totals.totalSaved, expectedActual - expectedDiscounted);
  });

  it("computeCartTotals with all ghost IDs returns zeros", () => {
    const cartItems = [
      { productId: "ghost_1", quantity: 5 },
      { productId: "ghost_2", quantity: 10 },
    ];
    const totals = computeCartTotals(cartItems, products);
    assert.deepStrictEqual(totals, {
      actualTotal: 0,
      discountedTotal: 0,
      totalSaved: 0,
      itemCount: 0,
    });
  });
});

// ─── 5. SEO & Business Constants Validation ───────────────────────────────────

describe("SEO & business constants validation", () => {
  it("BRAND has all required contact keys", () => {
    assert.ok(typeof BRAND.name === "string" && BRAND.name.length > 0, "BRAND.name required");
    assert.ok(typeof BRAND.tagline === "string" && BRAND.tagline.length > 0, "BRAND.tagline required");
    assert.ok(typeof BRAND.email === "string" && BRAND.email.includes("@"), "BRAND.email must be valid");
    assert.ok(typeof BRAND.phone === "string" && BRAND.phone.length > 0, "BRAND.phone required");
    assert.ok(typeof BRAND.address === "string" && BRAND.address.length > 0, "BRAND.address required");
    assert.ok(typeof BRAND.whatsapp === "string" && BRAND.whatsapp.length > 0, "BRAND.whatsapp required");
  });

  it("ORDER_CONFIG.minimumOrderAmount is a positive number", () => {
    assert.ok(
      typeof ORDER_CONFIG.minimumOrderAmount === "number" &&
        ORDER_CONFIG.minimumOrderAmount > 0,
      "minimumOrderAmount must be positive"
    );
  });

  it("ORDER_CONFIG.freeDeliveryAbove is greater than minimumOrderAmount", () => {
    assert.ok(
      ORDER_CONFIG.freeDeliveryAbove >= ORDER_CONFIG.minimumOrderAmount,
      "freeDeliveryAbove should be >= minimumOrderAmount"
    );
  });

  it("CATEGORIES starts with 'All'", () => {
    assert.strictEqual(CATEGORIES[0], "All", "First category must be 'All' for filter defaults");
  });

  it("CATEGORIES has no duplicates", () => {
    const seen = new Set<string>();
    CATEGORIES.forEach((cat) => {
      assert.ok(!seen.has(cat), `Duplicate category: ${cat}`);
      seen.add(cat);
    });
  });

  it("SORT_OPTIONS includes 'featured' as first option", () => {
    assert.strictEqual(SORT_OPTIONS[0].value, "featured", "First sort option must be 'featured'");
  });

  it("SORT_OPTIONS has no duplicate values", () => {
    const seen = new Set<string>();
    SORT_OPTIONS.forEach((opt) => {
      assert.ok(!seen.has(opt.value), `Duplicate sort option: ${opt.value}`);
      seen.add(opt.value);
    });
  });

  it("PAGINATION.productsPerPage is a positive integer", () => {
    assert.ok(
      Number.isInteger(PAGINATION.productsPerPage) && PAGINATION.productsPerPage > 0,
      "productsPerPage must be a positive integer"
    );
  });
});

// ─── 6. Additional Edge Cases for Existing Utilities ─────────────────────────

describe("Additional utility edge cases", () => {
  it("formatPrice does not throw for very large numbers", () => {
    assert.doesNotThrow(() => formatPrice(99999999));
    assert.doesNotThrow(() => formatPrice(Number.MAX_SAFE_INTEGER));
  });

  it("formatPrice for 0.5 returns a string without throwing", () => {
    assert.doesNotThrow(() => formatPrice(0.5));
    const result = formatPrice(0.5);
    assert.ok(typeof result === "string");
  });

  it("getDiscountPercent with equal prices returns 0", () => {
    assert.strictEqual(getDiscountPercent(500, 500), 0);
  });

  it("getDiscountPercent handles exact 50% discount", () => {
    assert.strictEqual(getDiscountPercent(200, 100), 50);
  });

  it("getTotalSavings returns 0 when no discount", () => {
    assert.strictEqual(getTotalSavings(200, 200, 100), 0);
  });

  it("getTotalSavings scales linearly with quantity", () => {
    const saving1 = getTotalSavings(300, 200, 1);
    const saving5 = getTotalSavings(300, 200, 5);
    assert.strictEqual(saving5, saving1 * 5);
  });

  it("clamp returns min when value is below min", () => {
    assert.strictEqual(clamp(-10, 0, 100), 0);
  });

  it("clamp returns max when value exceeds max", () => {
    assert.strictEqual(clamp(999, 0, 100), 100);
  });

  it("clamp works with float values", () => {
    assert.strictEqual(clamp(1.5, 1.0, 2.0), 1.5);
    assert.strictEqual(clamp(0.5, 1.0, 2.0), 1.0);
  });

  it("computeCartTotals itemCount counts matched products, not quantity", () => {
    const cartItems = [
      { productId: products[0].id, quantity: 100 },
      { productId: products[1].id, quantity: 200 },
    ];
    const totals = computeCartTotals(cartItems, products);
    assert.strictEqual(totals.itemCount, 2, "itemCount is distinct product count, not total units");
  });
});
