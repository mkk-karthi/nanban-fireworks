"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  ShoppingBag,
  FileDown,
  ArrowRight,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import { formatPrice, generateInvoiceNumber } from "../../_lib/utils";
import { ORDER_CONFIG } from "../../_lib/constants";
import { generateInvoicePdf, type CustomerDetails } from "../../_lib/pdfGenerator";
import type { CartProductItem, CartTotals } from "../../_lib/types";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartProductItem[];
  totals: CartTotals;
  onOrderSuccess: () => void;
}

const emptySubscribe = () => () => {};

/**
 * Clean Order Confirmation Modal:
 * Direct Sivakasi factory order confirmation with customer details,
 * auto-generates lightweight monochrome invoice PDF, auto-downloads it,
 * and renders an animated celebratory success view with re-download button.
 */
export function OrderModal({ isOpen, onClose, items, totals, onOrderSuccess }: OrderModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{
    orderId: string;
    savedCustomer: CustomerDetails;
  } | null>(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Partial<Record<keyof CustomerDetails, string>> = {};
    if (!customer.name.trim()) errs.name = "Please enter your full name";
    if (!customer.phone.trim()) {
      errs.phone = "Please enter your phone number";
    } else if (!/^[6-9]\d{9}$/.test(customer.phone.replace(/[\s-]/g, ""))) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!customer.email.trim()) {
      errs.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!customer.address.trim()) errs.address = "Please enter your delivery address";
    if (!customer.city.trim()) errs.city = "Please enter your city / district in Tamil Nadu";
    if (!customer.pincode.trim() || !/^\d{6}$/.test(customer.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit pincode";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ORDER_CONFIG.isOrderingEnabled) return;
    if (!validate()) return;

    setIsSubmitting(true);
    const orderId = generateInvoiceNumber();

    // Save snapshot of customer details for re-download
    const currentCustomer = { ...customer };

    try {
      // 1. Generate clean monochrome Invoice PDF (< 50KB) and auto-download
      generateInvoicePdf(items, currentCustomer, totals, orderId);

      // 2. Set complete state to transition to Animated Success Screen
      setOrderComplete({
        orderId,
        savedCustomer: currentCustomer,
      });
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualInvoiceDownload = () => {
    if (!orderComplete) return;
    generateInvoicePdf(items, orderComplete.savedCustomer, totals, orderComplete.orderId);
  };

  const handleDoneAndClose = () => {
    onOrderSuccess();
    setOrderComplete(null);
    onClose();
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="order-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-999 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto select-none"
        >
          <motion.div
            key="order-modal-card"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border-2 border-yellow-400 select-auto shrink-0"
          >
            {/* Modal Header */}
            <div className="bg-linear-to-r from-red-700 via-red-600 to-amber-600 text-white px-5 sm:px-6 py-4 sm:py-5 relative shrink-0">
              <button
                type="button"
                onClick={orderComplete ? handleDoneAndClose : onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 size-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                {orderComplete ? (
                  <>
                    <PackageCheck size={26} className="text-yellow-300" />
                    <span>Order Confirmed!</span>
                  </>
                ) : (
                  <span>Order Confirmation Details</span>
                )}
              </h2>
              <p className="text-red-100 text-xs sm:text-sm mt-0.5 font-medium">
                {orderComplete
                  ? "Your order has been recorded and your invoice has been downloaded."
                  : "Enter your contact details to place your factory order directly."}
              </p>
            </div>

            {/* Animated Success Screen Stage */}
            {orderComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto flex-1 overscroll-contain"
              >
                {/* Animated Success Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                  className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-green-200"
                >
                  <CheckCircle2 size={46} strokeWidth={2.5} />
                </motion.div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200 mb-2">
                    <Sparkles size={13} className="text-amber-600" />
                    <span>Order ID: {orderComplete.orderId}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Thank you, {orderComplete.savedCustomer.name}!
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
                    Your order of{" "}
                    <span className="font-bold text-red-600">{totals.itemCount} products</span>{" "}
                    worth{" "}
                    <span className="font-bold text-red-600">
                      {formatPrice(totals.discountedTotal)}
                    </span>{" "}
                    has been confirmed.
                  </p>
                </div>

                {/* PDF Auto Download Indicator */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs text-green-800 font-bold max-w-md mx-auto">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>Invoice PDF has been automatically downloaded to your device</span>
                </div>

                {/* What happens next guide */}
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-md mx-auto">
                  <p className="font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>What happens next?</span>
                  </p>
                  <div className="space-y-2 text-gray-700 leading-relaxed text-[11px] sm:text-xs">
                    <p>
                      <strong>1. Confirmation Call:</strong> Our factory representative will call
                      you at{" "}
                      <strong className="text-gray-900">{orderComplete.savedCustomer.phone}</strong>{" "}
                      to confirm order items and transport hub.
                    </p>
                    <p>
                      <strong>2. Secure Dispatch:</strong> Packed at our Sivakasi factory and
                      dispatched directly across Tamil Nadu.
                    </p>
                    <p>
                      <strong>3. Payment:</strong> Direct bank transfer, UPI, or cash on
                      confirmation.
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Download PDF again + Return */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  {/* Re-download button */}
                  <button
                    type="button"
                    onClick={handleManualInvoiceDownload}
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-extrabold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
                  >
                    <FileDown size={16} className="text-amber-800" />
                    <span>Download Invoice PDF</span>
                  </button>

                  {/* Done & Return button */}
                  <button
                    type="button"
                    onClick={handleDoneAndClose}
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Done & Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Order Entry Form */
              <form
                onSubmit={handleOrderSubmit}
                className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain"
              >
                {/* Ordering Disabled Warning */}
                {!ORDER_CONFIG.isOrderingEnabled && (
                  <div className="bg-red-50 border border-red-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-900">
                    <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-red-700">Orders Currently Disabled</p>
                      <p className="text-gray-700 leading-relaxed mt-0.5">
                        {ORDER_CONFIG.ordersDisabledMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prominent Tamil Nadu Delivery Notice */}
                <div className="bg-linear-to-r from-amber-50 to-orange-50/80 border border-amber-300 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs">
                  <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-700 uppercase tracking-wide text-[11px] flex items-center gap-1">
                      <span>Delivery Notice</span>
                    </p>
                    <p className="text-gray-700 leading-relaxed font-medium mt-0.5">
                      We deliver <strong>only within Tamil Nadu</strong> via direct Sivakasi
                      transport hubs. Orders outside Tamil Nadu cannot be processed.
                    </p>
                  </div>
                </div>

                {/* Order Summary Pill */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                    <ShoppingBag size={15} className="text-red-600" />
                    <span>{totals.itemCount} item(s)</span>
                  </div>
                  <div className="text-xs text-green-700 font-bold">
                    Saved {formatPrice(totals.totalSaved)}
                  </div>
                  <div className="font-extrabold text-red-700 text-sm sm:text-base">
                    Payable: {formatPrice(totals.discountedTotal)}
                  </div>
                </div>

                {/* Customer Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                      <User size={12} className="text-red-600" />
                      <span>Full Name</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senthil Kumar"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                      <Phone size={12} className="text-red-600" />
                      <span>Mobile Number</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number (e.g. 9876543210)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                      <Mail size={12} className="text-red-600" />
                      <span>Email Address</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.email}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                      <MapPin size={12} className="text-red-600" />
                      <span>Delivery Address / Transport Hub</span>{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Door No, Street Name, Area / Preferred Transport Hub"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.address
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* City / District (Tamil Nadu) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      <span>City / District (Tamil Nadu)</span>{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Madurai, Chennai, Coimbatore"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.city
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.city}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      <span>Pincode</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={customer.pincode}
                      onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.pincode
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:ring-red-400"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Action: "Order Now" */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !ORDER_CONFIG.isOrderingEnabled}
                    className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={19} strokeWidth={2.5} />
                        <span>Confirm & Place Factory Order</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 pb-1">
                  <AlertCircle size={12} className="text-amber-500" />
                  <span>
                    Direct Sivakasi factory order • Representative will call to confirm delivery
                  </span>
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
