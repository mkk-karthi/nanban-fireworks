import { describe, it, after, beforeEach } from "node:test";
import assert from "node:assert";
import { readFileSync, unlinkSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { useCartStore } from "../app/_store/cartStore";
import {
  computeCartTotals,
  formatPrice,
  getDiscountPercent,
  getTotalSavings,
  generateInvoiceNumber,
  clamp,
} from "../app/_lib/utils";
import {
  generateInvoicePdf,
  generateEstimatePdf,
  type CustomerDetails,
} from "../app/_lib/pdfGenerator";
import { ORDER_CONFIG } from "../app/_lib/constants";
import type { Product, CartProductItem } from "../app/_lib/types";

// Load datasets
const products: Product[] = JSON.parse(
  readFileSync(join(process.cwd(), "app/_data/products.json"), "utf-8")
);
const giftBoxes = JSON.parse(
  readFileSync(join(process.cwd(), "app/_data/giftBoxes.json"), "utf-8")
);

function cleanTestPdfs() {
  try {
    const files = readdirSync(process.cwd());
    for (const f of files) {
      if (f.startsWith("MKK_Fireworks_") && f.endsWith(".pdf")) {
        unlinkSync(join(process.cwd(), f));
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

describe("Comprehensive Edge Cases Test Suite", () => {
  after(() => {
    cleanTestPdfs();
  });

  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  // 1. CART STORE STATE & MUTATIONS EDGE CASES
  describe("Cart Store State & Mutations", () => {
    it("handles addItem with default quantity vs explicit quantity", () => {
      const store = useCartStore.getState();
      store.addItem("p001"); // default 1
      assert.strictEqual(useCartStore.getState().getItemQuantity("p001"), 1);

      store.addItem("p002", 5);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p002"), 5);
    });

    it("handles addItem with 0 or negative quantities safely (clamps to min 1)", () => {
      const store = useCartStore.getState();
      store.addItem("p001", 0);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p001"), 1);

      store.addItem("p002", -5);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p002"), 1);
    });

    it("accumulates quantities when adding existing items", () => {
      const store = useCartStore.getState();
      store.addItem("p001", 3);
      store.addItem("p001", 4);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p001"), 7);
      assert.strictEqual(useCartStore.getState().items.length, 1);
    });

    it("removes item when updateQuantity is called with 0 or negative numbers", () => {
      const store = useCartStore.getState();
      store.addItem("p001", 5);
      store.addItem("p002", 3);

      store.updateQuantity("p001", 0);
      assert.strictEqual(useCartStore.getState().isInCart("p001"), false);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p001"), 0);
      assert.strictEqual(useCartStore.getState().items.length, 1);

      store.updateQuantity("p002", -2);
      assert.strictEqual(useCartStore.getState().isInCart("p002"), false);
      assert.strictEqual(useCartStore.getState().items.length, 0);
    });

    it("handles updateQuantity for non-existent item (adds it if > 0)", () => {
      const store = useCartStore.getState();
      store.updateQuantity("p003", 4);
      assert.strictEqual(useCartStore.getState().getItemQuantity("p003"), 4);
      assert.strictEqual(useCartStore.getState().isInCart("p003"), true);
    });

    it("handles removeItem for non-existent item without crashing", () => {
      const store = useCartStore.getState();
      store.addItem("p001", 2);
      store.removeItem("non-existent-id");
      assert.strictEqual(useCartStore.getState().items.length, 1);
    });

    it("clears cart properly whether empty or populated", () => {
      const store = useCartStore.getState();
      store.clearCart();
      assert.strictEqual(useCartStore.getState().items.length, 0);

      store.addItem("p001", 10);
      store.addItem("p002", 20);
      store.clearCart();
      assert.strictEqual(useCartStore.getState().items.length, 0);
      assert.strictEqual(useCartStore.getState().getTotalUnits(), 0);
    });

    it("calculates getTotalUnits accurately across high-volume items", () => {
      const store = useCartStore.getState();
      for (let i = 1; i <= 10; i++) {
        store.addItem(`item_${i}`, 50);
      }
      assert.strictEqual(useCartStore.getState().getTotalUnits(), 500);
    });

    it("handles setHasHydrated state update", () => {
      const store = useCartStore.getState();
      store.setHasHydrated(true);
      assert.strictEqual(useCartStore.getState().hasHydrated, true);
      store.setHasHydrated(false);
      assert.strictEqual(useCartStore.getState().hasHydrated, false);
    });

    it("getTotalUnits returns 0 for empty cart without any items", () => {
      // Cart is cleared in beforeEach; confirm getTotalUnits works on empty state
      assert.strictEqual(useCartStore.getState().getTotalUnits(), 0);
      assert.strictEqual(useCartStore.getState().items.length, 0);
    });

    it("isInCart returns false for any product when cart is empty", () => {
      assert.strictEqual(useCartStore.getState().isInCart("p001"), false);
      assert.strictEqual(useCartStore.getState().isInCart(""), false);
    });
  });

  // 2. PRICING & CALCULATION UTILITIES EDGE CASES
  describe("Pricing & Calculation Utilities", () => {
    it("handles computeCartTotals with empty cart", () => {
      const totals = computeCartTotals([], products);
      assert.deepStrictEqual(totals, {
        actualTotal: 0,
        discountedTotal: 0,
        totalSaved: 0,
        itemCount: 0,
      });
    });

    it("handles computeCartTotals with corrupted/ghost product IDs gracefully", () => {
      const cartItems = [
        { productId: "p001", quantity: 2 },
        { productId: "ghost_id_999", quantity: 10 },
        { productId: "invalid_xyz", quantity: 5 },
      ];
      const totals = computeCartTotals(cartItems, products);
      const p001 = products.find((p) => p.id === "p001")!;
      assert.strictEqual(totals.itemCount, 1);
      assert.strictEqual(totals.actualTotal, p001.actualPrice * 2);
      assert.strictEqual(totals.discountedTotal, p001.discountedPrice * 2);
      assert.strictEqual(totals.totalSaved, (p001.actualPrice - p001.discountedPrice) * 2);
    });

    it("handles products with 0% discount (actualPrice === discountedPrice)", () => {
      const testProducts: Product[] = [
        {
          id: "no-disc",
          name: "Fixed Rate Crackers",
          actualPrice: 500,
          discountedPrice: 500,
          category: ["Standard"],
          images: [],
          isGiftBox: false,
        },
      ];
      const cartItems = [{ productId: "no-disc", quantity: 2 }];
      const totals = computeCartTotals(cartItems, testProducts);
      assert.strictEqual(totals.actualTotal, 1000);
      assert.strictEqual(totals.discountedTotal, 1000);
      assert.strictEqual(totals.totalSaved, 0);
    });

    it("handles extreme quantities (10,000 units) without arithmetic overflow", () => {
      const p = products[0];
      const cartItems = [{ productId: p.id, quantity: 10000 }];
      const totals = computeCartTotals(cartItems, products);
      assert.strictEqual(totals.actualTotal, p.actualPrice * 10000);
      assert.strictEqual(totals.discountedTotal, p.discountedPrice * 10000);
      assert.strictEqual(totals.totalSaved, (p.actualPrice - p.discountedPrice) * 10000);
    });

    it("calculates getDiscountPercent correctly for standard, zero, and 100% discounts", () => {
      assert.strictEqual(getDiscountPercent(100, 75), 25);
      assert.strictEqual(getDiscountPercent(200, 200), 0);
      assert.strictEqual(getDiscountPercent(100, 0), 100);
      assert.strictEqual(getDiscountPercent(120, 89), 26); // Math.round((31/120)*100) = 26
    });

    it("calculates getTotalSavings correctly across quantity multipliers", () => {
      assert.strictEqual(getTotalSavings(200, 150, 1), 50);
      assert.strictEqual(getTotalSavings(200, 150, 5), 250);
      assert.strictEqual(getTotalSavings(200, 200, 10), 0);
    });

    it("formats Indian Rupee prices with formatPrice", () => {
      const formatted0 = formatPrice(0);
      assert.ok(formatted0.includes("0"), "Should format 0");

      const formatted1000 = formatPrice(1000);
      assert.ok(formatted1000.includes("1,000") || formatted1000.includes("1000"));

      const formattedLakh = formatPrice(100000);
      assert.ok(formattedLakh.includes("1,00,000") || formattedLakh.includes("100,000") || formattedLakh.includes("100000"));
    });

    it("tests clamp utility across bounds", () => {
      assert.strictEqual(clamp(5, 10, 20), 10, "Should clamp to min");
      assert.strictEqual(clamp(25, 10, 20), 20, "Should clamp to max");
      assert.strictEqual(clamp(15, 10, 20), 15, "Should preserve in-bounds value");
      assert.strictEqual(clamp(10, 10, 10), 10, "Should handle min === max");
    });

    it("formatPrice for fractional values below ₹1 does not throw", () => {
      // Prices in the catalog are always integers, but guard against edge inputs
      assert.doesNotThrow(() => formatPrice(0));
      assert.doesNotThrow(() => formatPrice(0.5));
      const result = formatPrice(0);
      assert.ok(typeof result === "string" && result.includes("0"));
    });

    it("computeCartTotals skips items whose product is not found (itemCount excludes them)", () => {
      const allValidItems = products.slice(0, 3).map((p) => ({
        productId: p.id,
        quantity: 1,
      }));
      const withGhost = [...allValidItems, { productId: "__ghost__", quantity: 5 }];
      const totals = computeCartTotals(withGhost, products);
      assert.strictEqual(totals.itemCount, 3, "Ghost product should be excluded from itemCount");
    });

    it("validates generateInvoiceNumber format and uniqueness collision safety", () => {
      const generated = new Set<string>();
      for (let i = 0; i < 500; i++) {
        const id = generateInvoiceNumber();
        assert.match(
          id,
          /^MKK-\d{8}-\d{6}-\d{4}$/,
          `Invoice ID ${id} should match format MKK-YYYYMMDD-HHMMSS-XXXX`
        );
        generated.add(id);
      }
      assert.strictEqual(generated.size, 500, "500 sequentially generated IDs must all be unique");
    });
  });

  // 3. ORDER MINIMUM & BUSINESS CONSTRAINTS EDGE CASES
  describe("Order Minimum & Business Constraints", () => {
    const sampleItems: CartProductItem[] = [
      { product: products[0], quantity: 1 },
    ];

    it("rejects festive estimate generation when discounted total is below ₹3,000", () => {
      const belowMinTotals = {
        actualTotal: 3500,
        discountedTotal: 2999, // ₹1 short of ₹3000
        totalSaved: 501,
        itemCount: 1,
      };

      const result = generateEstimatePdf(sampleItems, belowMinTotals);
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("₹ 3,000"));
      assert.ok(result.error?.includes("2,999"));
    });

    it("accepts festive estimate generation at exact boundary ₹3,000", () => {
      const boundaryTotals = {
        actualTotal: 4000,
        discountedTotal: 3000, // Exact minimum threshold
        totalSaved: 1000,
        itemCount: 1,
      };

      const result = generateEstimatePdf(sampleItems, boundaryTotals);
      assert.strictEqual(result.success, true);
      assert.ok(result.estimateId?.startsWith("EST-"));
    });

    it("accepts festive estimate generation above ₹3,000", () => {
      const aboveMinTotals = {
        actualTotal: 6000,
        discountedTotal: 4500,
        totalSaved: 1500,
        itemCount: 1,
      };

      const result = generateEstimatePdf(sampleItems, aboveMinTotals);
      assert.strictEqual(result.success, true);
    });

    it("calculates shortfall and progress percentage accurately", () => {
      const minAmount = ORDER_CONFIG.minimumOrderAmount; // 3000
      
      const total0 = 0;
      assert.strictEqual(Math.max(0, minAmount - total0), 3000);
      assert.strictEqual(Math.min(100, Math.round((total0 / minAmount) * 100)), 0);

      const total1500 = 1500;
      assert.strictEqual(Math.max(0, minAmount - total1500), 1500);
      assert.strictEqual(Math.min(100, Math.round((total1500 / minAmount) * 100)), 50);

      const total2999 = 2999;
      assert.strictEqual(Math.max(0, minAmount - total2999), 1);
      assert.strictEqual(Math.min(100, Math.round((total2999 / minAmount) * 100)), 100);

      const total5000 = 5000;
      assert.strictEqual(Math.max(0, minAmount - total5000), 0);
      assert.strictEqual(Math.min(100, Math.round((total5000 / minAmount) * 100)), 100);
    });
  });

  // 4. CUSTOMER FORM VALIDATION EDGE CASES (OrderModal logic)
  describe("Customer Form Validation Rules", () => {
    // Phone validation helper matching OrderModal logic
    const isValidPhone = (phone: string) => {
      const cleaned = phone.replace(/[\s-]/g, "").trim();
      return /^[6-9]\d{9}$/.test(cleaned);
    };

    // Email validation helper matching OrderModal logic
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    // Pincode validation helper matching OrderModal logic
    const isValidPincode = (pincode: string) => {
      return /^\d{6}$/.test(pincode.trim());
    };

    it("validates Indian mobile numbers across edge cases", () => {
      // Valid cases (10 digits starting with 6, 7, 8, 9)
      assert.strictEqual(isValidPhone("9842198421"), true);
      assert.strictEqual(isValidPhone("8765432109"), true);
      assert.strictEqual(isValidPhone("7654321098"), true);
      assert.strictEqual(isValidPhone("6543210987"), true);
      assert.strictEqual(isValidPhone("98421 98421"), true, "Should accept spaced phone");
      assert.strictEqual(isValidPhone("9842-198421"), true, "Should accept hyphenated phone");

      // Invalid cases
      assert.strictEqual(isValidPhone(""), false, "Empty string");
      assert.strictEqual(isValidPhone("1234567890"), false, "Starts with 1");
      assert.strictEqual(isValidPhone("5842198421"), false, "Starts with 5");
      assert.strictEqual(isValidPhone("0984219842"), false, "Starts with 0");
      assert.strictEqual(isValidPhone("984219842"), false, "9 digits (too short)");
      assert.strictEqual(isValidPhone("98421984210"), false, "11 digits (too long)");
      assert.strictEqual(isValidPhone("98421ABCDE"), false, "Contains letters");
      assert.strictEqual(isValidPhone("+91 9842198421"), false, "+91 without stripping");
    });

    it("validates emails across edge cases", () => {
      // Valid emails
      assert.strictEqual(isValidEmail("customer@gmail.com"), true);
      assert.strictEqual(isValidEmail("ramesh.kumar@factory.co.in"), true);
      assert.strictEqual(isValidEmail("user+fireworks@domain.org"), true);
      assert.strictEqual(isValidEmail("a@b.cd"), true);

      // Invalid emails
      assert.strictEqual(isValidEmail(""), false, "Empty string");
      assert.strictEqual(isValidEmail("   "), false, "Whitespace string");
      assert.strictEqual(isValidEmail("plainaddress"), false, "No @");
      assert.strictEqual(isValidEmail("@missingusername.com"), false, "Missing username");
      assert.strictEqual(isValidEmail("user@.com"), false, "Missing domain name");
      assert.strictEqual(isValidEmail("user@domain"), false, "Missing TLD");
      assert.strictEqual(isValidEmail("user @ domain.com"), false, "Contains spaces");
    });

    it("validates Tamil Nadu / Indian pincodes across edge cases", () => {
      // Valid pincodes (6 digits)
      assert.strictEqual(isValidPincode("626123"), true, "Sivakasi pincode");
      assert.strictEqual(isValidPincode("625001"), true, "Madurai pincode");
      assert.strictEqual(isValidPincode("600001"), true, "Chennai pincode");

      // Invalid pincodes
      assert.strictEqual(isValidPincode(""), false, "Empty");
      assert.strictEqual(isValidPincode("62612"), false, "5 digits");
      assert.strictEqual(isValidPincode("6261234"), false, "7 digits");
      assert.strictEqual(isValidPincode("62612A"), false, "Contains letter");
      assert.strictEqual(isValidPincode("ABCDEF"), false, "All letters");
      assert.strictEqual(isValidPincode("626 123"), false, "Contains space");
    });
  });

  // 5. DUAL PDF GENERATOR ENGINE EDGE CASES
  describe("Dual PDF Generator Engine Edge Cases", () => {
    it("handles products with special characters in name and description", () => {
      const specialProduct: Product = {
        id: "p-spec-01",
        name: 'Mega "Giant" Ground Wheel & Flower Pots (Special 100%) - 5.5"',
        actualPrice: 450,
        discountedPrice: 320,
        category: ["Ground Chakkars"],
        images: [],
        isGiftBox: false,
      };

      const items: CartProductItem[] = [{ product: specialProduct, quantity: 10 }];
      const totals = {
        actualTotal: 4500,
        discountedTotal: 3200,
        totalSaved: 1300,
        itemCount: 1,
      };

      const customer: CustomerDetails = {
        name: 'M. & Co. "Traders" <Tamil Nadu>',
        phone: "9876543210",
        email: "m.traders+order@example.com",
        address: 'Shop #12, 1st Cross & 2nd Main Road',
        city: "Tirunelveli",
        pincode: "627001",
      };

      const invoiceResult = generateInvoicePdf(items, customer, totals, "MKK-SPEC-001");
      assert.strictEqual(invoiceResult.success, true);
      assert.ok(invoiceResult.doc.getNumberOfPages() >= 1);

      const estimateResult = generateEstimatePdf(items, totals);
      assert.strictEqual(estimateResult.success, true);
    });

    it("handles invoice PDF generation with fallback for missing/optional customer fields", () => {
      const minimalCustomer: CustomerDetails = {
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        pincode: "",
      };

      const items: CartProductItem[] = [{ product: products[0], quantity: 20 }];
      const totals = {
        actualTotal: 5000,
        discountedTotal: 3500,
        totalSaved: 1500,
        itemCount: 1,
      };

      const invoiceResult = generateInvoicePdf(items, minimalCustomer, totals, "MKK-MIN-001");
      assert.strictEqual(invoiceResult.success, true);
      assert.strictEqual(invoiceResult.doc.getNumberOfPages(), 1);
    });

    it("generates invoice PDF strictly under 40 KB for 1 to 20 items", () => {
      const items: CartProductItem[] = products.slice(0, 15).map((p) => ({
        product: p,
        quantity: 2,
      }));
      const totals = computeCartTotals(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        products
      );
      const customer: CustomerDetails = {
        name: "Quick Buyer",
        phone: "9123456789",
        email: "buyer@quick.com",
        address: "7 Temple View Road",
        city: "Salem",
        pincode: "636001",
      };

      const result = generateInvoicePdf(items, customer, totals, "MKK-SIZE-001");
      const buffer = result.doc.output("arraybuffer");
      const sizeKb = buffer.byteLength / 1024;
      assert.ok(sizeKb <= 30, `15-item invoice should be well below 30 KB, got ${sizeKb.toFixed(2)} KB`);
    });
  });

  // 6. DATASET & CATALOG INTEGRITY EDGE CASES
  describe("Dataset & Catalog Integrity", () => {
    it("ensures all products in products.json have valid structure and pricing", () => {
      assert.ok(products.length > 0, "Products catalog must not be empty");

      const seenIds = new Set<string>();

      products.forEach((product, idx) => {
        // Unique ID
        assert.ok(product.id, `Product at index ${idx} must have an id`);
        assert.strictEqual(
          seenIds.has(product.id),
          false,
          `Duplicate product ID found: ${product.id}`
        );
        seenIds.add(product.id);

        // Name
        assert.ok(
          product.name && product.name.trim().length > 0,
          `Product ${product.id} must have a non-empty name`
        );

        // Pricing
        assert.ok(
          typeof product.actualPrice === "number" && product.actualPrice > 0,
          `Product ${product.id} actualPrice must be a positive number`
        );
        assert.ok(
          typeof product.discountedPrice === "number" && product.discountedPrice > 0,
          `Product ${product.id} discountedPrice must be a positive number`
        );
        assert.ok(
          product.discountedPrice <= product.actualPrice,
          `Product ${product.id} discountedPrice (${product.discountedPrice}) cannot exceed actualPrice (${product.actualPrice})`
        );

        // Categories
        assert.ok(
          Array.isArray(product.category) && product.category.length > 0,
          `Product ${product.id} category must be a non-empty array`
        );

        // Images array
        assert.ok(
          Array.isArray(product.images),
          `Product ${product.id} images must be an array`
        );
      });
    });

    it("ensures all gift boxes in giftBoxes.json have valid structure and pricing", () => {
      assert.ok(giftBoxes.length > 0, "Gift boxes catalog must not be empty");

      const seenIds = new Set<string>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      giftBoxes.forEach((box: any, idx: number) => {
        assert.ok(box.id, `Gift box at index ${idx} must have an id`);
        assert.strictEqual(
          seenIds.has(box.id),
          false,
          `Duplicate gift box ID: ${box.id}`
        );
        seenIds.add(box.id);

        assert.ok(box.name && box.name.trim().length > 0, `Gift box ${box.id} must have a name`);
        assert.ok(
          typeof box.actualPrice === "number" && box.actualPrice > 0,
          `Gift box ${box.id} actualPrice must be positive`
        );
        assert.ok(
          typeof box.discountedPrice === "number" && box.discountedPrice > 0,
          `Gift box ${box.id} discountedPrice must be positive`
        );
        assert.ok(
          box.discountedPrice <= box.actualPrice,
          `Gift box ${box.id} discountedPrice cannot exceed actualPrice`
        );
        assert.ok(
          Array.isArray(box.category) && box.category.length > 0,
          `Gift box ${box.id} must have non-empty category array`
        );
        assert.strictEqual(box.isGiftBox, true, `Gift box ${box.id} must have isGiftBox: true`);
      });
    });
  });
});
