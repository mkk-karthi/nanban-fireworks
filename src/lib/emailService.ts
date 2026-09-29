import emailjs from "@emailjs/browser";
import { formatPrice } from "@/lib/utils";
import type { CartProductItem, CartTotals } from "@/lib/types";
import type { CustomerDetails } from "@/lib/pdfGenerator";

export interface SendOrderEmailParams {
  customer: CustomerDetails;
  items: CartProductItem[];
  totals: CartTotals;
  orderId: string;
  captchaToken?: string | null;
  pdfBase64?: string | null;
}

export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export interface OrderItemPayload {
  id: number;
  name: string;
  units: number;
  price: string;
}

// 50KB EmailJS Free Tier maximum payload ceiling guard (safe boundary set at 45KB)
export const MAX_PAYLOAD_BYTES = 45 * 1024;

/**
 * Builds array of line items for dynamic EmailJS template variables.
 */
export function buildOrderItems(items: CartProductItem[]): OrderItemPayload[] {
  return items.map((item, i) => ({
    id: i + 1,
    name: item.product.name,
    units: item.quantity,
    price: formatPrice(item.product.actualPrice),
  }));
}

/**
 * Builds a compact, responsive HTML table of the order line items.
 * Keeps table markup lightweight (<5KB even with 40-50 products).
 */
export function buildOrderItemsHtml(items: CartProductItem[]): string {
  const rows = items
    .map((item, index) => {
      const { product, quantity } = item;
      const unitPrice = product.discountedPrice ?? product.actualPrice;
      const rowTotal = unitPrice * quantity;
      const bg = index % 2 === 0 ? "#ffffff" : "#fffbeb";

      return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #fef3c7;">
          <td style="padding: 6px 8px; font-size: 12px; color: #4b5563; text-align: center;">${index + 1}</td>
          <td style="padding: 6px 8px; font-size: 12px; color: #1f2937; font-weight: 600;">${product.name}</td>
          <td style="padding: 6px 8px; font-size: 12px; color: #1f2937; text-align: center; font-weight: bold;">${quantity}</td>
          <td style="padding: 6px 8px; font-size: 12px; color: #4b5563; text-align: right;">${formatPrice(unitPrice)}</td>
          <td style="padding: 6px 8px; font-size: 12px; color: #b91c1c; font-weight: bold; text-align: right;">${formatPrice(rowTotal)}</td>
        </tr>
      `.trim();
    })
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; margin: 12px 0; border: 1px solid #fde68a;">
      <thead>
        <tr style="background-color: #b91c1c; color: #ffffff; text-align: left; font-size: 12px;">
          <th style="padding: 8px; text-align: center; width: 32px;">#</th>
          <th style="padding: 8px;">Product</th>
          <th style="padding: 8px; text-align: center; width: 44px;">Qty</th>
          <th style="padding: 8px; text-align: right; width: 75px;">Rate</th>
          <th style="padding: 8px; text-align: right; width: 85px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `.trim();
}

/**
 * Formats a localized timestamp for order notifications.
 */
function getOrderTimestamp(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Sends order notification email EXCLUSIVELY to the Store Admin template.
 * Free tier payload limit (50KB) is strictly respected.
 * Never throws an uncaught error to ensure customer checkout is never blocked.
 */
export async function sendAdminOrderEmail(
  params: SendOrderEmailParams,
): Promise<EmailServiceResult> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[EmailJS] Configuration missing (NEXT_PUBLIC_EMAILJS_*). Admin order email skipped.",
      );
    }
    return {
      success: false,
      skipped: true,
      error: "EmailJS environment variables not configured",
    };
  }

  const { customer, items, totals, orderId, captchaToken } = params;

  const templateParams: Record<string, string | number | OrderItemPayload[]> = {
    // Order Metadata
    order_id: orderId,
    order_date: getOrderTimestamp(),

    // Customer Details
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    customer_address: customer.address,
    customer_city: customer.city,
    customer_pincode: customer.pincode,

    // Order Totals
    total: formatPrice(totals.actualTotal),
    discount: formatPrice(totals.totalSaved),
    payable: formatPrice(totals.discountedTotal),

    // Dynamic items array for EmailJS template iteration
    orders: buildOrderItems(items),

    // Google reCAPTCHA token for verification
    "g-recaptcha-response": captchaToken || "",
  };

  // Enforce 45KB free tier ceiling guard
  const payloadBytes = new TextEncoder().encode(JSON.stringify(templateParams)).length;

  // If payload above 45KB (e.g. extremely huge order with hundreds of items), condense HTML table
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    const errorMessage = `[EmailJS] Payload size (${payloadBytes} bytes) exceeds safety ceiling (${MAX_PAYLOAD_BYTES} bytes).`;
    console.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return {
      success: true,
      messageId: response.text,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "text" in error
          ? String((error as { text: unknown }).text)
          : JSON.stringify(error);
    console.error("[EmailJS] Failed to send admin order notification:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
