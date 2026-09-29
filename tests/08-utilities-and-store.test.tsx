import {
  formatPrice,
  getDiscountPercent,
  generateInvoiceNumber,
  computeCartTotals,
} from "@/lib/utils";
import { ProductSchema, type Product } from "@/lib/types";
import rawProducts from "@/data/products.json";
import rawGiftBoxes from "@/data/giftBoxes.json";

const sampleProduct: Product = ProductSchema.parse(rawProducts[0]);
const sampleGiftBox: Product = ProductSchema.parse(rawGiftBoxes[0]);

describe("08: Pure Utility Functions & Cart Computation Logic", () => {
  describe("formatPrice – Indian Rupee formatting", () => {
    it("formats positive integers with INR symbol and Indian grouping", () => {
      expect(formatPrice(1250)).toBe("₹1,250");
      expect(formatPrice(100000)).toBe("₹1,00,000");
    });

    it("formats zero as ₹0", () => {
      expect(formatPrice(0)).toBe("₹0");
    });

    it("formats small amounts without grouping separators", () => {
      expect(formatPrice(50)).toBe("₹50");
      expect(formatPrice(999)).toBe("₹999");
    });
  });

  describe("getDiscountPercent – discount percentage calculation", () => {
    it("computes correct discount percentage", () => {
      expect(getDiscountPercent(1000, 700)).toBe(30);
      expect(getDiscountPercent(500, 250)).toBe(50);
    });

    it("returns 0 when actual and discounted prices are equal", () => {
      expect(getDiscountPercent(100, 100)).toBe(0);
    });

    it("rounds to nearest integer", () => {
      // 333/1000 = 33.3% → rounds to 33
      expect(getDiscountPercent(1000, 667)).toBe(33);
    });
  });

  describe("generateInvoiceNumber – unique order ID format", () => {
    it("produces NBC-YYYYMMDD-HHMMSS-XXXX format", () => {
      const id = generateInvoiceNumber();
      expect(id).toMatch(/^NBC-\d{8}-\d{6}-\d{4}$/);
    });

    it("generates unique IDs across consecutive calls", () => {
      const id1 = generateInvoiceNumber();
      const id2 = generateInvoiceNumber();
      expect(id1).not.toBe(id2);
    });
  });

  describe("computeCartTotals – cart total computation", () => {
    const catalog = [sampleProduct, sampleGiftBox];

    it("computes correct totals for mixed cart items", () => {
      const items = [
        { productId: sampleProduct.id, quantity: 3 },
        { productId: sampleGiftBox.id, quantity: 2 },
      ];

      const totals = computeCartTotals(items, catalog);

      expect(totals.actualTotal).toBe(
        sampleProduct.actualPrice * 3 + sampleGiftBox.actualPrice * 2
      );
      expect(totals.discountedTotal).toBe(
        sampleProduct.discountedPrice * 3 + sampleGiftBox.discountedPrice * 2
      );
      expect(totals.totalSaved).toBe(totals.actualTotal - totals.discountedTotal);
      expect(totals.itemCount).toBe(2);
    });

    it("returns zero totals for an empty cart", () => {
      const totals = computeCartTotals([], catalog);

      expect(totals.actualTotal).toBe(0);
      expect(totals.discountedTotal).toBe(0);
      expect(totals.totalSaved).toBe(0);
      expect(totals.itemCount).toBe(0);
    });

    it("skips items with unknown productId gracefully", () => {
      const items = [
        { productId: "nonexistent-id-xyz", quantity: 5 },
        { productId: sampleProduct.id, quantity: 1 },
      ];

      const totals = computeCartTotals(items, catalog);

      // Only the valid product is counted
      expect(totals.actualTotal).toBe(sampleProduct.actualPrice);
      expect(totals.discountedTotal).toBe(sampleProduct.discountedPrice);
      expect(totals.itemCount).toBe(1);
    });
  });
});
