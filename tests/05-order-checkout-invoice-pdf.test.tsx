import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrderModal } from "@/components/cart/OrderModal";
import { generateInvoicePdf } from "@/lib/pdfGenerator";
import { ProductSchema, type Product, type CartProductItem } from "@/lib/types";
import { sendAdminOrderEmail } from "@/lib/emailService";
import rawProducts from "@/data/products.json";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockPdfSave } = require("jspdf");

jest.mock("@/lib/emailService", () => ({
  sendAdminOrderEmail: jest.fn().mockResolvedValue({ success: true, messageId: "msg-123" }),
}));

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

/** DRY helper: fills all 6 customer fields with valid sample data */
function fillValidForm() {
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
}

describe("05: Order Checkout Modal, Form Validation & Invoice PDF", () => {
  const origKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  beforeEach(() => {
    mockPdfSave.mockClear();
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = origKey;
  });

  it("validates all required customer fields and displays error hints when submitted empty or invalid", () => {
    render(
      <OrderModal
        isOpen={true}
        onClose={jest.fn()}
        items={cartItems}
        totals={sampleTotals}
        onOrderSuccess={jest.fn()}
      />
    );

    const form = document.querySelector("form")!;

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
    fireEvent.change(screen.getByPlaceholderText(/10-digit number/i), {
      target: { value: "12345" },
    });
    fireEvent.submit(form);
    expect(
      screen.getByText("Enter a valid 10-digit Indian mobile number")
    ).toBeInTheDocument();

    // Test invalid email format
    fireEvent.change(screen.getByPlaceholderText(/your\.email@example\.com/i), {
      target: { value: "invalid-email-format" },
    });
    fireEvent.submit(form);
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();

    // Test invalid pincode format
    fireEvent.change(screen.getByPlaceholderText(/6-digit pincode/i), {
      target: { value: "123" },
    });
    fireEvent.submit(form);
    expect(screen.getByText("Enter a valid 6-digit pincode")).toBeInTheDocument();

    // Test min length constraints: name < 3, email < 10, address < 10, city < 3
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Senthil Kumar/i), {
      target: { value: "Ab" },
    });
    fireEvent.change(screen.getByPlaceholderText(/your\.email@example\.com/i), {
      target: { value: "a@b.co" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Door No, Street Name, Area/i), {
      target: { value: "Short" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Madurai, Chennai, Coimbatore/i), {
      target: { value: "TN" },
    });
    fireEvent.submit(form);
    expect(screen.getByText("Name must be between 3 and 50 characters")).toBeInTheDocument();
    expect(screen.getByText("Email must be between 10 and 50 characters")).toBeInTheDocument();
    expect(screen.getByText("Address must be between 10 and 150 characters")).toBeInTheDocument();
    expect(screen.getByText("City must be between 3 and 25 characters")).toBeInTheDocument();
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
    fillValidForm();
    fireEvent.submit(form);

    // Verify invoice PDF was generated and downloaded
    await waitFor(() => {
      expect(mockPdfSave).toHaveBeenCalledWith(
        expect.stringMatching(/^Nanban_Crackers_Invoice_NBC-.*\.pdf$/)
      );
    });

    // Verify admin order email was dispatched with customer, totals, and pdfBase64
    expect(sendAdminOrderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: expect.objectContaining({
          name: "Karthikeyan M",
          phone: "9876543210",
          email: "karthi@example.com",
        }),
        totals: sampleTotals,
        pdfBase64: expect.any(String),
      })
    );

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
    fireEvent.click(reDownloadBtn);
    expect(mockPdfSave).toHaveBeenCalledTimes(2);

    // Click "Done & Continue"
    const doneBtn = screen.getByRole("button", { name: /Done & Continue/i });
    fireEvent.click(doneBtn);

    expect(onOrderSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not complete order and displays professional error message if email dispatch fails", async () => {
    (sendAdminOrderEmail as jest.Mock).mockResolvedValueOnce({
      success: false,
      skipped: false,
      error: "Service unavailable",
    });

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
    fillValidForm();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Your order could not be processed at the moment/i)
      ).toBeInTheDocument();
    });

    // Ensure order complete screen is NOT displayed and PDF was NOT downloaded
    expect(screen.queryByText(/Thank you, Karthikeyan M!/i)).not.toBeInTheDocument();
    expect(onOrderSuccess).not.toHaveBeenCalled();
    expect(mockPdfSave).not.toHaveBeenCalled();
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

  it("generateInvoicePdf handles large order (30 items) by creating multi-page document cleanly", () => {
    const customer = {
      name: "Murugan K",
      phone: "9842100000",
      email: "murugan@example.com",
      address: "45 Bypass Road",
      city: "Sivakasi",
      pincode: "626123",
    };
    const orderId = "NBC-TEST-30ITEMS";
    const largeCart: CartProductItem[] = Array.from({ length: 30 }, (_, i) => ({
      product: { ...sampleProduct, id: `prod-${i + 1}`, name: `Product Item ${i + 1}` },
      quantity: 2,
    }));
    const largeTotals = {
      actualTotal: 60000,
      discountedTotal: 40000,
      totalSaved: 20000,
      itemCount: 30,
    };

    const result = generateInvoicePdf(largeCart, customer, largeTotals, orderId, false);

    expect(result.success).toBe(true);
    expect(result.doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });
});
