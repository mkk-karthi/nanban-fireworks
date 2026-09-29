import type { Product, CartTotals } from "./types";

// Price Formatting

/** Shared formatter instance – created once at module load, not per call */
const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a number as Indian Rupee (e.g. ₹1,250) */
export const formatPrice = (price: number): string => priceFormatter.format(price);

// Discount Helpers

/** Returns the discount percentage off the actual price */
export const getDiscountPercent = (
  actualPrice: number,
  discountedPrice: number
): number => Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);

// Cart Calculation Helpers

/**
 * Compute cart totals from cart items and the full products list.
 * Items whose productId isn't found in products are skipped.
 */
export const computeCartTotals = (
  cartItems: { productId: string; quantity: number }[],
  products: Product[]
): CartTotals => {
  let actualTotal = 0;
  let discountedTotal = 0;
  let matchedCount = 0;

  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    actualTotal += product.actualPrice * item.quantity;
    discountedTotal += product.discountedPrice * item.quantity;
    matchedCount += 1;
  }

  return {
    actualTotal,
    discountedTotal,
    totalSaved: actualTotal - discountedTotal,
    itemCount: matchedCount,
  };
};

let invoiceSeq = 1000;

/**
 * Generates a unique, collision-resistant Invoice Number formatted for Sivakasi orders.
 * Format: NBC-YYYYMMDD-HHMMSS-XXXX (e.g. NBC-20260918-134520-8941)
 */
export const generateInvoiceNumber = (): string => {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const timePart = `${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
  invoiceSeq = ((invoiceSeq + 1) % 9000) + 1000;
  return `NBC-${datePart}-${timePart}-${invoiceSeq}`;
};

// DOM Helpers

/** Smooth-scroll to the #products section after a rAF tick (avoids layout thrash) */
export const scrollToProducts = (): void => {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};
