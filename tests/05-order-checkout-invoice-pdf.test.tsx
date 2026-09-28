import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrderModal } from "@/components/cart/OrderModal";
import { generateInvoicePdf } from "@/lib/pdfGenerator";
import { ProductSchema, type Product, type CartProductItem } from "@/lib/types";
import rawProducts from "@/data/products.json";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockPdfSave } = require("jspdf");

const sampleProduct: Product = ProductSchema.parse(rawProducts[0]);
const cartItems: CartProductItem[] = [
  { product: sampleProduct, quantity: 5 },
];
const sampleTotals = {
  actualTotal: 5000,
  discountedTotal: 3500,
  totalSaved: 1500,
  itemCount: 1,
};

describe("05: Order Checkout Modal, Form Validation & Invoice PDF", () => {
  beforeEach(() => {
    mockPdfSave.mockClear();
  });

  it("validates all required customer fields and displays error hints when submitted empty or invalid", () => {
    const onClose = jest.fn();
    const onOrderSuccess = jest.fn();

    render(
      <OrderModal
        isOpen={true}
        onClose={onClose}
        items={cartItems}
        totals={sampleTotals}
        onOrderSuccess={onOrderSuccess}
      />
    );

    // Because OrderModal uses createPortal into document.body
    const form = document.querySelector("form")!;
    expect(form).toBeInTheDocument();

    // Submit without entering any data
    fireEvent.submit(form);

    // Verify error messages for all required fields
    expect(screen.getByText("Please enter your full name")).toBeInTheDocument();
    expect(screen.getByText("Please enter your phone number")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
    expect(screen.getByText("Please enter your delivery address")).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your city / district in Tamil Nadu")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter a valid 6-digit pincode")).toBeInTheDocument();

    // Test invalid phone format
    const phoneInput = screen.getByPlaceholderText(/10-digit number/i);
    fireEvent.change(phoneInput, { target: { value: "12345" } });
    fireEvent.submit(form);
    expect(
      screen.getByText("Enter a valid 10-digit Indian mobile number")
    ).toBeInTheDocument();

    // Test invalid email format
    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email-format" } });
    fireEvent.submit(form);
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();

    // Test invalid pincode format
    const pincodeInput = screen.getByPlaceholderText(/6-digit pincode/i);
    fireEvent.change(pincodeInput, { target: { value: "123" } });
    fireEvent.submit(form);
    expect(screen.getByText("Enter a valid 6-digit pincode")).toBeInTheDocument();
  });

  it("submits valid customer inputs, generates invoice PDF, shows success screen, and clears cart on done", async () => {
    const onClose = jest.fn();
    const onOrderSuccess = jest.fn();

    render(
      <OrderModal
        isOpen={true}
        onClose={onClose}
        items={cartItems}
        totals={sampleTotals}
        onOrderSuccess={onOrderSuccess}
      />
    );

    const form = document.querySelector("form")!;
    expect(form).toBeInTheDocument();

    // Fill valid sample inputs
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Senthil Kumar/i), {
      target: { value: "Karthikeyan M" },
    });
    fireEvent.change(screen.getByPlaceholderText(/10-digit number/i), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText(/your\.email@example\.com/i), {
      target: { value: "karthi@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Door No, Street Name, Area/i),
      { target: { value: "123 Factory Road, Sivakasi Hub" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/e\.g\. Madurai, Chennai, Coimbatore/i),
      { target: { value: "Madurai" } }
    );
    fireEvent.change(screen.getByPlaceholderText(/6-digit pincode/i), {
      target: { value: "625001" },
    });

    // Submit form
    fireEvent.submit(form);

    // Verify invoice PDF was generated and downloaded
    await waitFor(() => {
      expect(mockPdfSave).toHaveBeenCalledWith(
        expect.stringMatching(/^Nanban_Crackers_Invoice_NBC-.*\.pdf$/)
      );
    });

    // Verify success view rendered
    await waitFor(() => {
      expect(screen.getByText(/Thank you, Karthikeyan M!/i)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Invoice PDF has been automatically downloaded to your device/i)
    ).toBeInTheDocument();

    // Re-download invoice button
    const reDownloadBtn = screen.getByRole("button", {
      name: /Download Invoice PDF/i,
    });
    expect(reDownloadBtn).toBeInTheDocument();
    fireEvent.click(reDownloadBtn);
    expect(mockPdfSave).toHaveBeenCalledTimes(2);

    // Click "Done & Continue"
    const doneBtn = screen.getByRole("button", { name: /Done & Continue/i });
    fireEvent.click(doneBtn);

    expect(onOrderSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("generateInvoicePdf helper creates invoice document and triggers save with order ID", () => {
    const customer = {
      name: "Murugan K",
      phone: "9842100000",
      email: "murugan@example.com",
      address: "45 Bypass Road",
      city: "Sivakasi",
      pincode: "626123",
    };
    const orderId = "NBC-TEST-999999";

    const result = generateInvoicePdf(cartItems, customer, sampleTotals, orderId);

    expect(result.success).toBe(true);
    expect(result.orderId).toBe(orderId);
    expect(mockPdfSave).toHaveBeenCalledWith(`Nanban_Crackers_Invoice_${orderId}.pdf`);
  });
});
