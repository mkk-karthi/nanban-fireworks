import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartSummary } from "@/components/cart/CartSummary";
import { generateEstimatePdf } from "@/lib/pdfGenerator";
import { ORDER_CONFIG } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { ProductSchema, type Product, type CartProductItem } from "@/lib/types";
import rawProducts from "@/data/products.json";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockPdfSave } = require("jspdf");

const sampleProduct: Product = ProductSchema.parse(rawProducts[0]);

describe("04: Minimum Order Enforcement & Festive Estimate PDF Download", () => {
  const minAmount = ORDER_CONFIG.minimumOrderAmount; // ₹3,000

  beforeEach(() => {
    mockPdfSave.mockClear();
  });

  it("shows shortfall progress bar and restricts Order Now button when order is below ₹3,000", () => {
    const discountedTotal = 1500;
    const actualTotal = 2500;
    const totalSaved = 1000;
    const shortfall = minAmount - discountedTotal;

    const onCheckout = jest.fn();
    const onGenerateEstimate = jest.fn();

    render(
      <CartSummary
        actualTotal={actualTotal}
        discountedTotal={discountedTotal}
        totalSaved={totalSaved}
        itemCount={1}
        onCheckout={onCheckout}
        onGenerateEstimate={onGenerateEstimate}
      />
    );

    // Progress target is displayed
    expect(
      screen.getByText(new RegExp(`Minimum Order Target: ${formatPrice(minAmount)}`, "i"))
    ).toBeInTheDocument();

    // Shortfall message is displayed
    expect(
      screen.getByText(/more fireworks to unlock Sivakasi direct factory checkout!/i)
    ).toBeInTheDocument();

    // "Order Now" button is NOT rendered
    expect(screen.queryByRole("button", { name: /Order Now/i })).not.toBeInTheDocument();

    // "Add ... More to Order" link button is present
    expect(
      screen.getByRole("link", {
        name: new RegExp(`Add ${formatPrice(shortfall)} More to Order`, "i"),
      })
    ).toBeInTheDocument();

    // Notice that Estimate PDF is available for orders >= minAmount
    expect(
      screen.getByText(
        new RegExp(`PDF Estimate available for orders ${formatPrice(minAmount)} and above`, "i")
      )
    ).toBeInTheDocument();
  });

  it("enables Order Now and Generate Estimate PDF buttons when order meets ₹3,000 threshold", () => {
    const discountedTotal = 3500;
    const actualTotal = 5000;
    const totalSaved = 1500;

    const onCheckout = jest.fn();
    const onGenerateEstimate = jest.fn();

    render(
      <CartSummary
        actualTotal={actualTotal}
        discountedTotal={discountedTotal}
        totalSaved={totalSaved}
        itemCount={3}
        onCheckout={onCheckout}
        onGenerateEstimate={onGenerateEstimate}
      />
    );

    // Minimum met badge is rendered
    expect(
      screen.getByText(/Minimum order amount met! Ready for factory dispatch/i)
    ).toBeInTheDocument();

    // Order Now button is enabled and clickable
    const orderNowBtn = screen.getByRole("button", { name: /Order Now/i });
    expect(orderNowBtn).toBeInTheDocument();
    expect(orderNowBtn).not.toBeDisabled();
    fireEvent.click(orderNowBtn);
    expect(onCheckout).toHaveBeenCalledTimes(1);

    // Generate Estimate PDF button is present and clickable
    const estimateBtn = screen.getByRole("button", { name: /Generate Estimate PDF/i });
    expect(estimateBtn).toBeInTheDocument();
    fireEvent.click(estimateBtn);
    expect(onGenerateEstimate).toHaveBeenCalledTimes(1);
  });

  it("successfully generates festive estimate PDF and triggers download when total >= ₹3,000", () => {
    const cartItems: CartProductItem[] = [
      { product: sampleProduct, quantity: 10 },
    ];
    const totals = {
      actualTotal: 5000,
      discountedTotal: 3500,
      totalSaved: 1500,
      itemCount: 1,
    };

    const result = generateEstimatePdf(cartItems, totals);

    expect(result.success).toBe(true);
    expect(result.estimateId).toMatch(/^EST-\d+/);
    expect(mockPdfSave).toHaveBeenCalledTimes(1);
    expect(mockPdfSave).toHaveBeenCalledWith(
      expect.stringMatching(/^MKK_Fireworks_Estimate_EST-.*\.pdf$/)
    );
  });

  it("rejects festive estimate PDF generation when total < ₹3,000", () => {
    const cartItems: CartProductItem[] = [
      { product: sampleProduct, quantity: 1 },
    ];
    const totals = {
      actualTotal: 2000,
      discountedTotal: 1500,
      totalSaved: 500,
      itemCount: 1,
    };

    const result = generateEstimatePdf(cartItems, totals);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Estimate PDF can only be generated for orders above/i);
    expect(mockPdfSave).not.toHaveBeenCalled();
  });
});
