import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND, CONTACT, ORDER_CONFIG } from "./constants";
import { generateInvoiceNumber } from "./utils";
import { robotoRegularBase64 } from "./pdfFont";
import type { CartProductItem, CartTotals } from "./types";

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

export type OrderTotals = CartTotals;

/**
 * Initializes and registers the Roboto TTF font (from public/Roboto-Regular.ttf) in jsPDF
 * to render clean typography, numbers, and the official Indian Rupee symbol (₹).
 */
function setupDocFont(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

/**
 * Shared DRY helper to format cart items for jsPDF autotable.
 */
function formatPdfTableData(items: CartProductItem[]): string[][] {
  return items.map((item, index) => {
    const unitPrice = item.product.discountedPrice ?? item.product.actualPrice;
    const itemTotal = unitPrice * item.quantity;
    return [
      (index + 1).toString(),
      item.product.name,
      `₹ ${item.product.actualPrice.toLocaleString("en-IN")}`,
      `₹ ${unitPrice.toLocaleString("en-IN")}`,
      item.quantity.toString(),
      `₹ ${itemTotal.toLocaleString("en-IN")}`,
    ];
  });
}

/**
 * Shared DRY date formatting helper for PDF documents.
 */
function getPdfDateString(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// 1. FESTIVE ESTIMATE PDF (Above ₹3,000 only, No customer details, Rich colors)
/**
 * Generates an attractive, festive Estimate PDF for customer preview.
 * - Allowed only when discountedTotal >= ₹3,000
 * - Does NOT include customer details
 * - Does NOT include Ref No (only Date)
 * - Category column is omitted
 * - Header uses "#" for item numbering
 * - Indian Rupee symbol (₹) rendered natively with official Roboto font
 * - Uses rich festive theme colors (Crimson, Golden Yellow, Warm White)
 * - Contains NO images
 */
export function generateEstimatePdf(
  items: CartProductItem[],
  totals: OrderTotals
): { success: boolean; error?: string; estimateId?: string } {
  if (totals.discountedTotal < ORDER_CONFIG.minimumOrderAmount) {
    return {
      success: false,
      error: `Estimate PDF can only be generated for orders above ₹ ${ORDER_CONFIG.minimumOrderAmount.toLocaleString("en-IN")}. Current total is ₹ ${totals.discountedTotal.toLocaleString("en-IN")}.`,
    };
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  setupDocFont(doc);

  const estimateId = `EST-${Date.now().toString().slice(-6)}`;
  const estimateDate = getPdfDateString();

  // Header Banner (Crimson Festive Background)
  doc.setFillColor(200, 16, 46); // #C8102E
  doc.rect(0, 0, 210, 38, "F");

  // Golden accent bar
  doc.setFillColor(255, 215, 0); // #FFD700
  doc.rect(0, 38, 210, 3, "F");

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(22);
  doc.text(BRAND.name.toUpperCase(), 14, 18);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 235, 235);
  doc.text("Direct Sivakasi Factory Wholesale & Retail Pricing", 14, 25);
  doc.text(`${CONTACT.address} | Phone: ${CONTACT.phone}`, 14, 31);

  // Estimate Title & Meta (Right side - Date only, No Ref. No)
  doc.setFont("Roboto", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 215, 0); // Gold
  doc.text("PRICE ESTIMATE", 196, 20, { align: "right" });

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date: ${estimateDate}`, 196, 28, { align: "right" });

  // Festive Estimate Notice Banner
  const startY = 47;
  doc.setFillColor(255, 251, 240); // Warm ivory
  doc.setDrawColor(254, 215, 170); // Warm border
  doc.roundedRect(14, startY, 182, 16, 2, 2, "FD");

  doc.setTextColor(160, 13, 37);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.text("FESTIVAL SPECIAL PRICE QUOTATION", 20, startY + 6.5);

  doc.setTextColor(80, 80, 80);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.text(
    "All prices shown include festival wholesale discounts. Direct dispatch from Sivakasi factory transport hubs.",
    20,
    startY + 11.5
  );

  // Items Table (Category Column Removed, '#' used for number)
  const tableData = formatPdfTableData(items);

  autoTable(doc, {
    startY: startY + 21,
    margin: { left: 14, right: 14 },
    head: [["#", "Product Name", "MRP", "Offer Rate", "Qty", "Total Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      font: "Roboto",
      fontStyle: "bold",
      fillColor: [200, 16, 46],
      textColor: [255, 255, 255],
      halign: "center",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 94, halign: "left" },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
    },
    styles: {
      font: "Roboto",
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 40, 40],
      lineColor: [240, 220, 200],
    },
    alternateRowStyles: {
      fillColor: [255, 253, 245],
    },
  });

  // Totals & Notes Section
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = (doc.lastAutoTable?.finalY ?? 150) + 6;

  // Left side: Order & Dispatch Notes Box
  doc.setFillColor(255, 251, 240);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, finalY, 92, 32, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(160, 13, 37);
  doc.text("Order & Dispatch Notes:", 18, finalY + 7);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("• Minimum order ₹ 3,000 required for factory dispatch.", 18, finalY + 13);
  doc.text("• Deliveries strictly within Tamil Nadu transport hubs.", 18, finalY + 18);
  doc.text("• Final invoice generated upon order confirmation.", 18, finalY + 23);

  // Right side: Totals Box
  doc.setFillColor(255, 251, 240);
  doc.setDrawColor(200, 16, 46);
  doc.roundedRect(110, finalY, 86, 32, 2, 2, "FD");

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Total MRP Value:", 114, finalY + 7);
  doc.text(`₹ ${totals.actualTotal.toLocaleString("en-IN")}`, 192, finalY + 7, { align: "right" });

  doc.setTextColor(22, 163, 74);
  doc.setFont("Roboto", "bold");
  doc.text("Your Festival Discount:", 114, finalY + 14);
  doc.text(`- ₹ ${totals.totalSaved.toLocaleString("en-IN")}`, 192, finalY + 14, { align: "right" });

  doc.setDrawColor(230, 200, 180);
  doc.line(114, finalY + 17, 192, finalY + 17);

  doc.setTextColor(160, 13, 37);
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("Estimated Net Payable:", 114, finalY + 24);
  doc.text(`₹ ${totals.discountedTotal.toLocaleString("en-IN")}`, 192, finalY + 24, { align: "right" });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(200, 16, 46);
  doc.rect(0, pageHeight - 12, 210, 12, "F");

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Thank you for choosing ${BRAND.name}! Direct Sivakasi Factory Quality Fireworks.`,
    105,
    pageHeight - 5.5,
    { align: "center" }
  );

  doc.save(`MKK_Fireworks_Estimate_${estimateId}.pdf`);
  return { success: true, estimateId };
}

// 2. FINAL ORDER INVOICE PDF (Monochrome, Simple, Lightweight, No images)
/**
 * Generates a clean, simple, professional monochrome Invoice PDF for confirmed orders.
 * - Uses official Roboto font with native Indian Rupee symbol (₹)
 * - Category column is omitted
 * - Header uses "#" for item numbering (matching estimate PDF)
 * - Terms & totals sections aligned without overlap matching estimate style
 * - Contains customer & shipping details, order number, timestamp, item details, breakdown
 * - Contains NO images
 */
export function generateInvoicePdf(
  items: CartProductItem[],
  customer: CustomerDetails,
  totals: OrderTotals,
  orderId: string
): { success: boolean; orderId: string; doc: jsPDF } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  setupDocFont(doc);

  const invoiceDate = getPdfDateString();

  // Header: Company & Invoice Info (Clean Monochrome)
  doc.setFont("Roboto", "bold");
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(BRAND.name.toUpperCase(), 14, 18);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(CONTACT.address, 14, 23);
  doc.text(`Phone: ${CONTACT.phone} | Email: ${CONTACT.email}`, 14, 27.5);

  // Invoice Title & Meta Box (Right aligned)
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("TAX / RETAIL INVOICE", 196, 18, { align: "right" });

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`Invoice No: ${orderId}`, 196, 23, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, 196, 27.5, { align: "right" });

  // Divider line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.line(14, 31.5, 196, 31.5);

  // Customer / Delivery Address Box
  const startY = 35;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, startY, 182, 24, 1.5, 1.5, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text("CUSTOMER & DELIVERY DETAILS", 18, startY + 5.5);

  doc.setFontSize(7.5);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Customer Name:", 18, startY + 11);
  doc.text("Phone / Email:", 18, startY + 16);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(customer.name || "Valued Customer", 48, startY + 11);
  doc.text(`${customer.phone || "N/A"}  |  ${customer.email || "N/A"}`, 48, startY + 16);

  doc.setFont("Roboto", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Delivery Address:", 112, startY + 11);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(17, 24, 39);
  const fullAddress = [customer.address, customer.city, customer.pincode, "Tamil Nadu"].filter(Boolean).join(", ");
  doc.text(fullAddress || "Direct Sivakasi Transport Dispatch", 112, startY + 16, {
    maxWidth: 80,
  });

  // Items Table (Category Column Removed, '#' used for item number)
  const tableData = formatPdfTableData(items);

  autoTable(doc, {
    startY: startY + 28,
    margin: { left: 14, right: 14 },
    head: [["#", "Description / Product", "MRP", "Rate", "Qty", "Amount"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      font: "Roboto",
      fontStyle: "bold",
      fillColor: [243, 244, 246], // Light gray header
      textColor: [17, 24, 39],
      fontSize: 8,
      lineColor: [209, 213, 219],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 94, halign: "left" },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
    },
    styles: {
      font: "Roboto",
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
  });

  // Totals & Terms Section (Matched layout with estimate PDF, Zero Overlap)
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = (doc.lastAutoTable?.finalY ?? 140) + 5;

  // Left side: Terms & Delivery Guidelines Box (x: 14, width: 92)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, finalY, 92, 28, 1.5, 1.5, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text("TERMS & DELIVERY GUIDELINES", 18, finalY + 6);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text("1. Dispatched directly from Sivakasi factory transport hubs.", 18, finalY + 11.5);
  doc.text("2. Service strictly within Tamil Nadu. Transport hub confirmed by call.", 18, finalY + 16.5);
  doc.text("3. Payment: Direct bank transfer / UPI or cash on confirmation.", 18, finalY + 21.5);

  // Right side: Totals Box (x: 110, width: 86)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(110, finalY, 86, 28, 1.5, 1.5, "FD");

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text("Total MRP:", 114, finalY + 6.5);
  doc.text(`₹ ${totals.actualTotal.toLocaleString("en-IN")}`, 192, finalY + 6.5, { align: "right" });

  doc.text("Festival Discount:", 114, finalY + 12.5);
  doc.text(`- ₹ ${totals.totalSaved.toLocaleString("en-IN")}`, 192, finalY + 12.5, { align: "right" });

  doc.setDrawColor(229, 231, 235);
  doc.line(114, finalY + 15.5, 192, finalY + 15.5);

  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Net Payable Amount:", 114, finalY + 22);
  doc.text(`₹ ${totals.discountedTotal.toLocaleString("en-IN")}`, 192, finalY + 22, { align: "right" });

  // Simple Minimalist Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 12, 196, pageHeight - 12);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `This is a computer generated invoice from ${BRAND.name}, Sivakasi. No physical signature required.`,
    105,
    pageHeight - 7,
    { align: "center" }
  );

  doc.save(`MKK_Fireworks_Invoice_${orderId}.pdf`);
  return { success: true, orderId, doc };
}

/**
 * Backward compatibility alias
 */
export const generateOrderPdf = (
  items: CartProductItem[],
  customer: CustomerDetails,
  totals: OrderTotals
) => {
  const orderId = generateInvoiceNumber();
  return generateInvoicePdf(items, customer, totals, orderId);
};
