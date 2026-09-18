import { describe, it, after } from "node:test";
import assert from "node:assert";
import { readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { useCartStore } from "../app/_store/cartStore";
import { computeCartTotals, generateInvoiceNumber } from "../app/_lib/utils";
import { generateInvoicePdf, generateEstimatePdf, type CustomerDetails } from "../app/_lib/pdfGenerator";
import { ORDER_CONFIG } from "../app/_lib/constants";
import type { Product, CartProductItem } from "../app/_lib/types";
import { readdirSync } from "node:fs";

function cleanTestPdfs() {
  try {
    const files = readdirSync(process.cwd());
    for (const f of files) {
      if (f.startsWith("MKK_Fireworks_") && f.endsWith(".pdf")) {
        unlinkSync(join(process.cwd(), f));
      }
    }
  } catch {
    // Ignore cleanup error
  }
}

// Load actual product database
const productsPath = join(process.cwd(), "app/_data/products.json");
const allProducts: Product[] = JSON.parse(readFileSync(productsPath, "utf-8"));

describe("End-to-End Order Workflow: 60+ Products", () => {
  after(() => {
    cleanTestPdfs();
  });
  it("should have at least 60 products in catalog for bulk testing", () => {
    assert.ok(
      allProducts.length >= 60,
      `Expected at least 60 products in catalog, found ${allProducts.length}`
    );
  });

  it("completes a full end-to-end customer order of 65 distinct products", () => {
    // 1. Clear store before test
    const store = useCartStore.getState();
    store.clearCart();
    assert.strictEqual(store.items.length, 0, "Cart should initially be empty");
    assert.strictEqual(store.getTotalUnits(), 0, "Total units should initially be 0");

    // 2. Select 65 distinct products across various categories
    const targetProductsCount = 65;
    const selectedProducts = allProducts.slice(0, targetProductsCount);
    assert.strictEqual(selectedProducts.length, 65);

    // Track expected units & totals manually
    let expectedTotalUnits = 0;
    let expectedActualTotal = 0;
    let expectedDiscountedTotal = 0;

    const cartProductItems: CartProductItem[] = [];

    // 3. Add all 65 products with varying realistic quantities (1 to 8 units)
    selectedProducts.forEach((product, index) => {
      // Deterministic variable quantity per item: (index % 5) + 1 -> 1, 2, 3, 4, 5 units
      const qty = (index % 5) + 1;
      store.addItem(product.id, qty);

      expectedTotalUnits += qty;
      const unitPrice = product.discountedPrice ?? product.actualPrice;
      expectedActualTotal += product.actualPrice * qty;
      expectedDiscountedTotal += unitPrice * qty;

      cartProductItems.push({
        product,
        quantity: qty,
      });
    });

    // 4. Verify Zustand Store State
    const updatedStore = useCartStore.getState();
    assert.strictEqual(updatedStore.items.length, 65, "Cart must contain exactly 65 distinct item entries");
    assert.strictEqual(updatedStore.getTotalUnits(), expectedTotalUnits, "Total units must match sum of all quantities");

    // Verify all 65 items are acknowledged by selectors
    for (let i = 0; i < selectedProducts.length; i++) {
      const p = selectedProducts[i];
      const expectedQty = (i % 5) + 1;
      assert.strictEqual(updatedStore.isInCart(p.id), true, `Product ${p.id} should be in cart`);
      assert.strictEqual(updatedStore.getItemQuantity(p.id), expectedQty, `Product ${p.id} quantity mismatch`);
    }

    // 5. Verify Totals Calculation
    const totals = computeCartTotals(updatedStore.items, allProducts);
    assert.strictEqual(totals.itemCount, 65, "Item count should be 65 distinct products");
    assert.strictEqual(totals.actualTotal, expectedActualTotal, "Actual MRP total must match");
    assert.strictEqual(totals.discountedTotal, expectedDiscountedTotal, "Discounted net total must match");
    assert.strictEqual(
      totals.totalSaved,
      expectedActualTotal - expectedDiscountedTotal,
      "Total saved must equal actualTotal - discountedTotal"
    );

    // Verify order meets Sivakasi factory minimum dispatch threshold
    assert.ok(
      totals.discountedTotal >= ORDER_CONFIG.minimumOrderAmount,
      `65 items total ₹${totals.discountedTotal} should easily exceed minimum threshold of ₹${ORDER_CONFIG.minimumOrderAmount}`
    );

    // 6. Test Customer Details & Validation
    const customer: CustomerDetails = {
      name: "Murugan Sundaram",
      phone: "9842198421",
      email: "murugan.sundaram@gmail.com",
      address: "42, South Car Street, Near Bus Stand",
      city: "Madurai",
      pincode: "625001",
      notes: "Please pack in wooden crates for festival transit",
    };

    // Validate phone pattern (10 digits starting with 6-9)
    assert.match(customer.phone, /^[6-9]\d{9}$/, "Phone must be valid 10-digit Indian number");
    // Validate email pattern
    assert.match(customer.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be valid format");
    // Validate 6-digit Tamil Nadu pincode
    assert.match(customer.pincode, /^\d{6}$/, "Pincode must be 6 digits");

    // 7. Dual PDF Generation Engine: 65-Item Festive Estimate PDF
    const estimateResult = generateEstimatePdf(cartProductItems, totals);
    assert.strictEqual(estimateResult.success, true, "Estimate PDF generation should succeed for 65 items");
    assert.ok(estimateResult.estimateId?.startsWith("EST-"), "Estimate ID should have 'EST-' prefix");

    // 8. Dual PDF Generation Engine: 65-Item Final Monochrome Invoice PDF
    const orderId = generateInvoiceNumber();
    assert.match(orderId, /^MKK-\d{8}-\d{6}-\d{4}$/, "Order ID must match format MKK-YYYYMMDD-HHMMSS-XXXX");

    const invoiceResult = generateInvoicePdf(cartProductItems, customer, totals, orderId);
    assert.strictEqual(invoiceResult.success, true, "Invoice PDF generation should succeed for 65 items");
    assert.strictEqual(invoiceResult.orderId, orderId);
    assert.ok(invoiceResult.doc, "jsPDF instance should be returned");

    // Multi-page verification: 65 items must span across multiple pages (typically 3-4 pages)
    const pageCount = invoiceResult.doc.getNumberOfPages();
    assert.ok(pageCount >= 2, `65 items should span multiple pages, got ${pageCount} pages`);

    // Verify compressed size constraint (<= 40 KB as per project guidelines)
    const pdfOutput = invoiceResult.doc.output("arraybuffer");
    const pdfSizeKb = pdfOutput.byteLength / 1024;
    console.log(`[E2E Test] 65-product invoice generated with ${pageCount} pages, size: ${pdfSizeKb.toFixed(2)} KB`);
    assert.ok(
      pdfSizeKb <= 40,
      `Invoice PDF size for 65 items (${pdfSizeKb.toFixed(2)} KB) must not exceed 40 KB threshold`
    );

    // 9. Complete Order: Clear Cart Post-Checkout
    store.clearCart();
    const finalStore = useCartStore.getState();
    assert.strictEqual(finalStore.items.length, 0, "Cart should be empty after order completion");
    assert.strictEqual(finalStore.getTotalUnits(), 0, "Total units should be 0 after order completion");
  });

  it("handles maximum catalog stress test: 100 products order with invoice generation under size limit", () => {
    const store = useCartStore.getState();
    store.clearCart();

    const cartProductItems: CartProductItem[] = allProducts.map((product, idx) => {
      const qty = (idx % 3) + 1; // 1 to 3 of each
      store.addItem(product.id, qty);
      return { product, quantity: qty };
    });

    const currentStore = useCartStore.getState();
    assert.strictEqual(currentStore.items.length, allProducts.length);
    const totals = computeCartTotals(currentStore.items, allProducts);
    assert.strictEqual(totals.itemCount, allProducts.length);

    const orderId = generateInvoiceNumber();
    const customer: CustomerDetails = {
      name: "Factory Wholesale Buyer",
      phone: "9876543210",
      email: "wholesale@fireworksfactory.in",
      address: "Sivakasi Bypass Road, Depot 4",
      city: "Virudhunagar",
      pincode: "626123",
    };

    const invoiceResult = generateInvoicePdf(cartProductItems, customer, totals, orderId);
    assert.strictEqual(invoiceResult.success, true);
    
    const pages = invoiceResult.doc.getNumberOfPages();
    assert.ok(pages >= 3, `100 items should span at least 3 pages, got ${pages}`);

    const pdfOutput = invoiceResult.doc.output("arraybuffer");
    const pdfSizeKb = pdfOutput.byteLength / 1024;
    console.log(`[E2E Test] 100-product max catalog invoice: ${pages} pages, size: ${pdfSizeKb.toFixed(2)} KB`);
    assert.ok(pdfSizeKb <= 45, `100-item invoice size (${pdfSizeKb.toFixed(2)} KB) should stay compact`);

    // Clean up
    useCartStore.getState().clearCart();
  });
});
