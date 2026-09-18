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

/** Total savings for a given quantity */
export const getTotalSavings = (
  actualPrice: number,
  discountedPrice: number,
  qty: number
): number => (actualPrice - discountedPrice) * qty;

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
 * Generates a unique, collision-resistant Invoice Number formatted for factory orders.
 * Format: MKK-YYYYMMDD-HHMMSS-XXXX (e.g. MKK-20260918-134520-8941)
 */
export const generateInvoiceNumber = (): string => {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const timePart = `${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
  invoiceSeq = ((invoiceSeq + 1) % 9000) + 1000;
  return `MKK-${datePart}-${timePart}-${invoiceSeq}`;
};

// Array Helpers

/** Clamp a value between min and max (inclusive) */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

