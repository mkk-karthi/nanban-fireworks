import { render, screen, waitFor, act } from "@testing-library/react";
import emailjs from "@emailjs/browser";
import { buildOrderItemsHtml, sendAdminOrderEmail, MAX_PAYLOAD_BYTES } from "@/lib/emailService";
import { GoogleRecaptcha } from "@/components/common/GoogleRecaptcha";
import { ProductSchema, type Product, type CartProductItem } from "@/lib/types";
import rawProducts from "@/data/products.json";

// Mock @emailjs/browser
jest.mock("@emailjs/browser", () => ({
  send: jest.fn(),
}));

const allProducts: Product[] = rawProducts.map((p) => ProductSchema.parse(p));
const sampleProduct: Product = allProducts[0];
const cartItems: CartProductItem[] = [{ product: sampleProduct, quantity: 4 }];

const sampleTotals = {
  actualTotal: 4000,
  discountedTotal: 2800,
  totalSaved: 1200,
  itemCount: 1,
};

const sampleCustomer = {
  name: "Karthikeyan Admin",
  phone: "9876543210",
  email: "karthik@example.com",
  address: "10 Direct Sivakasi Bypass",
  city: "Madurai",
  pincode: "625001",
};

describe("07: EmailJS Free Tier Service & Google reCAPTCHA", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete (window as unknown as { grecaptcha?: unknown }).grecaptcha;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("HTML & Text Item Formatting", () => {
    it("builds a lightweight, readable HTML table without heavy styling", () => {
      const html = buildOrderItemsHtml(cartItems);
      expect(html).toContain("<table");
      expect(html).toContain(sampleProduct.name);
      expect(html).toContain("Qty");
      expect(html).toContain("4");
      // Verify styling is lightweight and clean
      expect(html).toContain("border-collapse: collapse");
      expect(html).toContain("font-family: sans-serif");
      // Verify size is tiny (< 3KB for single item)
      const sizeBytes = new TextEncoder().encode(html).length;
      expect(sizeBytes).toBeLessThan(3000);
    });
  });

  describe("EmailJS Admin Email Dispatch & 45KB Free Tier Ceiling", () => {
    it("skips sending gracefully if EmailJS environment variables are missing", async () => {
      delete process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      delete process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      delete process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      const result = await sendAdminOrderEmail({
        customer: sampleCustomer,
        items: cartItems,
        totals: sampleTotals,
        orderId: "NBC-TEST-123456",
      });

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(emailjs.send).not.toHaveBeenCalled();
    });

    it("sends order notification with all required template parameters within the 45KB limit", async () => {
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = "service_test_id";
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = "template_test_id";
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "public_key_test";

      (emailjs.send as jest.Mock).mockResolvedValueOnce({
        status: 200,
        text: "OK",
      });

      const orderId = "NBC-2026-998877";
      const result = await sendAdminOrderEmail({
        customer: sampleCustomer,
        items: cartItems,
        totals: sampleTotals,
        orderId,
        captchaToken: "test-recaptcha-token",
      });

      expect(result.success).toBe(true);
      expect(emailjs.send).toHaveBeenCalledTimes(1);

      const [calledServiceId, calledTemplateId, templateParams, calledPublicKey] = (
        emailjs.send as jest.Mock
      ).mock.calls[0];

      expect(calledServiceId).toBe("service_test_id");
      expect(calledTemplateId).toBe("template_test_id");
      expect(calledPublicKey).toBe("public_key_test");

      // Verify parameters passed to admin template
      expect(templateParams.order_id).toBe(orderId);
      expect(templateParams.customer_name).toBe("Karthikeyan Admin");
      expect(templateParams.customer_phone).toBe("9876543210");
      expect(templateParams.customer_city).toBe("Madurai");
      expect(templateParams["g-recaptcha-response"]).toBe("test-recaptcha-token");
      expect(templateParams.orders).toBeDefined();
      expect(templateParams.total).toBeDefined();
      expect(templateParams.payable).toBeDefined();

      // Verify total payload size stays well under 45KB ceiling (46,080 bytes)
      const payloadSize = new TextEncoder().encode(JSON.stringify(templateParams)).length;
      expect(payloadSize).toBeLessThan(MAX_PAYLOAD_BYTES);
    });

    it("handles huge bulk orders (143 catalog items) and keeps total email payload strictly below 45KB", async () => {
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = "service_test_bulk";
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = "template_test_bulk";
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "public_key_bulk";

      (emailjs.send as jest.Mock).mockResolvedValueOnce({
        status: 200,
        text: "OK",
      });

      // Construct a large bulk order containing all 143 catalog items
      const bulkItems: CartProductItem[] = allProducts.map((product, idx) => ({
        product,
        quantity: (idx % 10) + 1,
      }));

      const bulkTotals = {
        actualTotal: 250000,
        discountedTotal: 180000,
        totalSaved: 70000,
        itemCount: bulkItems.length,
      };

      const result = await sendAdminOrderEmail({
        customer: sampleCustomer,
        items: bulkItems,
        totals: bulkTotals,
        orderId: "NBC-BULK-143ITEMS",
      });

      expect(result.success).toBe(true);
      expect(emailjs.send).toHaveBeenCalledTimes(1);

      const [, , templateParams] = (emailjs.send as jest.Mock).mock.calls[0];
      const payloadBytes = new TextEncoder().encode(JSON.stringify(templateParams)).length;

      // Verify strict < 45KB (45 * 1024 = 46080 bytes)
      expect(payloadBytes).toBeLessThan(MAX_PAYLOAD_BYTES);
      expect(templateParams.orders).toHaveLength(bulkItems.length);
    });

    it("catches and handles API failures without throwing unhandled exceptions", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = "service_test";
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = "template_test";
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "key_test";

      (emailjs.send as jest.Mock).mockRejectedValueOnce(
        new Error("Free quota exceeded (200/month limit reached)"),
      );

      const result = await sendAdminOrderEmail({
        customer: sampleCustomer,
        items: cartItems,
        totals: sampleTotals,
        orderId: "NBC-ERR-001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Free quota exceeded");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[EmailJS] Failed to send admin order notification:",
        expect.stringContaining("Free quota exceeded"),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("GoogleRecaptcha Component", () => {
    it("gracefully bypasses and calls onSuccess when no site key is configured", async () => {
      const onSuccess = jest.fn();
      render(<GoogleRecaptcha siteKey="" onSuccess={onSuccess} />);

      expect(screen.getByText(/Anti-bot protection active/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("dev-bypass-token");
      });
    });

    it("renders reCAPTCHA widget container when site key is provided", () => {
      const onSuccess = jest.fn();
      render(
        <GoogleRecaptcha
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onSuccess={onSuccess}
        />
      );

      expect(screen.getByTestId("google-recaptcha-widget")).toBeInTheDocument();
    });

    it("renders reCAPTCHA using window.grecaptcha.render when API is available", () => {
      const mockRender = jest.fn().mockReturnValue(123);
      window.grecaptcha = {
        render: mockRender,
        reset: jest.fn(),
        ready: (cb: () => void) => cb(),
      } as unknown as typeof window.grecaptcha;

      const onSuccess = jest.fn();
      render(
        <GoogleRecaptcha
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onSuccess={onSuccess}
        />
      );

      expect(mockRender).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
          theme: "light",
        })
      );
    });

    it("triggers onSuccess callback when reCAPTCHA generates a token", () => {
      let capturedCallback: ((token: string) => void) | undefined;
      window.grecaptcha = {
        render: jest.fn().mockImplementation((_, opts) => {
          capturedCallback = opts.callback;
          return 1;
        }),
        reset: jest.fn(),
        ready: (cb: () => void) => cb(),
      } as unknown as typeof window.grecaptcha;

      const onSuccess = jest.fn();
      render(
        <GoogleRecaptcha
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onSuccess={onSuccess}
        />
      );

      expect(capturedCallback).toBeDefined();
      capturedCallback!("valid-recaptcha-token");
      expect(onSuccess).toHaveBeenCalledWith("valid-recaptcha-token");
    });

    it("triggers onExpire callback when token expires", () => {
      let capturedExpire: (() => void) | undefined;
      window.grecaptcha = {
        render: jest.fn().mockImplementation((_, opts) => {
          capturedExpire = opts["expired-callback"];
          return 1;
        }),
        reset: jest.fn(),
        ready: (cb: () => void) => cb(),
      } as unknown as typeof window.grecaptcha;

      const onExpire = jest.fn();
      render(
        <GoogleRecaptcha
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onSuccess={jest.fn()}
          onExpire={onExpire}
        />
      );

      expect(capturedExpire).toBeDefined();
      capturedExpire!();
      expect(onExpire).toHaveBeenCalled();
    });

    it("triggers onError callback when reCAPTCHA encounters error", () => {
      let capturedError: (() => void) | undefined;
      window.grecaptcha = {
        render: jest.fn().mockImplementation((_, opts) => {
          capturedError = opts["error-callback"];
          return 1;
        }),
        reset: jest.fn(),
        ready: (cb: () => void) => cb(),
      } as unknown as typeof window.grecaptcha;

      const onError = jest.fn();
      render(
        <GoogleRecaptcha
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onSuccess={jest.fn()}
          onError={onError}
        />
      );

      expect(capturedError).toBeDefined();
      act(() => {
        capturedError!();
      });
      expect(onError).toHaveBeenCalledWith("reCAPTCHA verification failed");
    });
  });
});
