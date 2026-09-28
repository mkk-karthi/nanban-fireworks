import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/home/ProductCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/store/cartStore";
import { computeCartTotals, formatPrice } from "@/lib/utils";
import { ProductSchema, type Product } from "@/lib/types";
import rawProducts from "@/data/products.json";
import rawGiftBoxes from "@/data/giftBoxes.json";

const sampleProduct: Product = ProductSchema.parse(rawProducts[0]);
const sampleGiftBox: Product = ProductSchema.parse(rawGiftBoxes[0]);
const allCatalog = [sampleProduct, sampleGiftBox];

describe("03: Cart Interactions, Stepper Controls & Discount Calculations", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().setHasHydrated(true);
  });

  describe("Regular ProductCard Stepper Interactions", () => {
    it("transitions from Add to Cart button to stepper and manages quantity accurately", () => {
      render(<ProductCard product={sampleProduct} />);

      // Initially shows "Add to Cart" button with 0 in cart
      const addBtn = screen.getByRole("button", {
        name: `Add ${sampleProduct.name} to cart`,
      });
      expect(addBtn).toBeInTheDocument();

      // Click "Add to Cart"
      fireEvent.click(addBtn);

      // Transitions to stepper showing "1 in Cart"
      expect(screen.getByText("1 in Cart")).toBeInTheDocument();

      // Increment (+) button increases to 2
      const plusBtn = screen.getByRole("button", {
        name: `Increase ${sampleProduct.name} quantity`,
      });
      fireEvent.click(plusBtn);
      expect(screen.getByText("2 in Cart")).toBeInTheDocument();

      // Decrement (-) button decreases back to 1
      const minusBtn = screen.getByRole("button", {
        name: `Decrease ${sampleProduct.name} quantity`,
      });
      fireEvent.click(minusBtn);
      expect(screen.getByText("1 in Cart")).toBeInTheDocument();

      // Decrement again resets quantity to 0 and restores "Add to Cart" button
      fireEvent.click(minusBtn);
      expect(
        screen.getByRole("button", {
          name: `Add ${sampleProduct.name} to cart`,
        })
      ).toBeInTheDocument();
    });
  });

  describe("Gift Box Combo Stepper Interactions", () => {
    it("renders Add Combo button and transitions to stepper upon addition", () => {
      render(<ProductCard product={sampleGiftBox} variant="giftBox" />);

      // Displays "Add Combo" button
      const addComboBtn = screen.getByRole("button", {
        name: new RegExp(`Add ${sampleGiftBox.name} combo to cart`, "i"),
      });
      expect(addComboBtn).toBeInTheDocument();

      // Click Add Combo
      fireEvent.click(addComboBtn);

      // Transitions to stepper
      expect(screen.getByText("1 in Cart")).toBeInTheDocument();
      expect(useCartStore.getState().items.find(i => i.productId === sampleGiftBox.id)?.quantity ?? 0).toBe(1);
    });
  });

  describe("Calculations with All Discounts Applied", () => {
    it("computes accurate MRP total, festival discounts, and net payable in CartSummary", () => {
      // Add 2 units of regular product and 1 unit of gift box
      useCartStore.getState().updateQuantity(sampleProduct.id, 2);
      useCartStore.getState().updateQuantity(sampleGiftBox.id, 1);

      const items = useCartStore.getState().items;
      const totals = computeCartTotals(items, allCatalog);

      const expectedActualTotal = sampleProduct.actualPrice * 2 + sampleGiftBox.actualPrice * 1;
      const expectedDiscountedTotal =
        sampleProduct.discountedPrice * 2 + sampleGiftBox.discountedPrice * 1;
      const expectedSaved = expectedActualTotal - expectedDiscountedTotal;

      expect(totals.actualTotal).toBe(expectedActualTotal);
      expect(totals.discountedTotal).toBe(expectedDiscountedTotal);
      expect(totals.totalSaved).toBe(expectedSaved);

      // Render CartSummary
      render(
        <CartSummary
          actualTotal={totals.actualTotal}
          discountedTotal={totals.discountedTotal}
          totalSaved={totals.totalSaved}
          itemCount={2}
          onCheckout={jest.fn()}
          onGenerateEstimate={jest.fn()}
        />
      );

      // Check Total MRP Value
      expect(screen.getByText(formatPrice(expectedActualTotal))).toBeInTheDocument();

      // Check Festival Discount
      expect(screen.getByText(`− ${formatPrice(expectedSaved)}`)).toBeInTheDocument();

      // Check Net Payable
      expect(screen.getByText(formatPrice(expectedDiscountedTotal))).toBeInTheDocument();

      // Check Total Savings badge
      expect(screen.getAllByText(formatPrice(expectedSaved)).length).toBeGreaterThanOrEqual(1);
    });
  });
});
