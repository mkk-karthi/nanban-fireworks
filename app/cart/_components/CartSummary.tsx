"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Tag,
  BadgePercent,
  Wallet,
  Sparkles,
  CheckCircle2,
  FileDown,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatPrice } from "../../_lib/utils";
import { ORDER_CONFIG } from "../../_lib/constants";

interface CartSummaryProps {
  actualTotal: number;
  discountedTotal: number;
  totalSaved: number;
  itemCount: number;
  onCheckout: () => void;
  onGenerateEstimate?: () => void;
  onDownloadQuickPdf?: () => void;
}

/**
 * Order summary sidebar with attractive minimum order progress tracker,
 * order availability flag check, and festive PDF estimate generation.
 */
export function CartSummary({
  actualTotal,
  discountedTotal,
  totalSaved,
  itemCount,
  onCheckout,
  onGenerateEstimate,
  onDownloadQuickPdf,
}: CartSummaryProps) {
  const { minimumOrderAmount, isOrderingEnabled, ordersDisabledMessage } = ORDER_CONFIG;
  const meetsMinimum = discountedTotal >= minimumOrderAmount;
  const shortfall = Math.max(0, minimumOrderAmount - discountedTotal);
  const progressPercent = Math.min(100, Math.round((discountedTotal / minimumOrderAmount) * 100));
  const handleEstimate = onGenerateEstimate ?? onDownloadQuickPdf;

  return (
    <aside className="bg-white rounded-3xl border border-amber-100 shadow-xl overflow-hidden sticky top-24">

      {/* Summary Header */}
      <div className="bg-linear-to-r from-red-700 via-red-600 to-amber-600 px-6 py-5 text-white">
        <h2 className="font-black text-lg sm:text-xl flex items-center gap-2">
          <Wallet size={22} strokeWidth={2.5} />
          <span>Order Summary</span>
        </h2>
        <p className="text-red-100 text-xs mt-0.5 font-medium">
          {itemCount} distinct product(s) selected
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-5">

        {/* Ordering Disabled Alert Banner */}
        {!isOrderingEnabled && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-xs text-red-900 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-red-700">
              <AlertTriangle size={17} className="text-red-600 shrink-0" />
              <span>Orders Temporarily Closed</span>
            </div>
            <p className="leading-relaxed text-gray-700 text-[11px]">
              {ordersDisabledMessage}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3 text-sm">
          {/* Actual MRP */}
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1.5">
              <Tag size={15} className="text-gray-400" />
              Total MRP Value
            </span>
            <span className="line-through text-gray-400 font-semibold">
              {formatPrice(actualTotal)}
            </span>
          </div>

          {/* Festival Discount with Offer Icon */}
          <div className="flex justify-between text-green-700 font-bold">
            <span className="flex items-center gap-1.5">
              <BadgePercent size={16} className="text-green-600" />
              Festival Discount
            </span>
            <span>− {formatPrice(totalSaved)}</span>
          </div>

          <div className="h-px bg-amber-100" />

          {/* Final Payable */}
          <div className="flex justify-between text-lg font-black text-gray-900">
            <span>Net Payable</span>
            <span className="text-red-700 text-xl">{formatPrice(discountedTotal)}</span>
          </div>

          {/* Total savings badge */}
          {totalSaved > 0 && (
            <div className="flex items-center justify-between text-xs bg-green-50 text-green-800 font-bold px-3 py-1.5 rounded-xl border border-green-200">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-green-600" />
                Your Total Savings
              </span>
              <span>{formatPrice(totalSaved)}</span>
            </div>
          )}
        </div>

        {/* Minimum Order Progress Card (Below ₹3,000) */}
        {!meetsMinimum && discountedTotal > 0 && isOrderingEnabled && (
          <div className="bg-linear-to-br from-amber-50 to-orange-50/80 border-2 border-amber-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-950 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" />
                Minimum Order Target: {formatPrice(minimumOrderAmount)}
              </span>
              <span className="text-red-700 font-black">{progressPercent}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-amber-200/70 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-linear-to-r from-amber-500 via-orange-500 to-red-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              Add <span className="font-black text-red-700">{formatPrice(shortfall)}</span> more fireworks to unlock Sivakasi direct factory checkout!
            </p>
          </div>
        )}

        {/* Minimum Met Banner */}
        {meetsMinimum && isOrderingEnabled && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3.5 text-xs text-green-800 font-extrabold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span>Minimum order amount met! Ready for factory dispatch.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Below ₹3,000: Attractive "Add More" Action Button */}
          {!meetsMinimum && isOrderingEnabled && (
            <Link
              href="/#products"
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-red-950 font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-yellow-500/25 transition-all duration-200 active:scale-95 text-sm sm:text-base border-2 border-yellow-300"
            >
              <Sparkles size={18} />
              <span>Add {formatPrice(shortfall)} More to Order</span>
              <ArrowRight size={18} />
            </Link>
          )}

          {/* Minimum Met: Order Now Button */}
          {meetsMinimum && isOrderingEnabled && (
            <button
              onClick={onCheckout}
              disabled={itemCount === 0}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-red-600/30 transition-all duration-200 active:scale-95 text-sm sm:text-base cursor-pointer"
            >
              <ShoppingCart size={20} strokeWidth={2.5} />
              <span>Order Now</span>
            </button>
          )}

          {/* Orders Disabled State Button */}
          {!isOrderingEnabled && (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-bold py-3.5 px-4 rounded-2xl text-sm border border-gray-200 cursor-not-allowed text-center">
              <AlertTriangle size={16} />
              <span>Orders Currently Disabled</span>
            </div>
          )}

          {/* Generate Estimate Button (Direct cart page PDF estimate generation - Strictly >= 3000) */}
          {itemCount > 0 && isOrderingEnabled && handleEstimate && meetsMinimum && (
            <button
              type="button"
              onClick={handleEstimate}
              className="w-full flex items-center justify-center gap-2 border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <FileDown size={16} className="text-amber-700" />
              <span>Generate Estimate PDF</span>
            </button>
          )}

          {/* Hint when below 3000 */}
          {itemCount > 0 && isOrderingEnabled && !meetsMinimum && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 text-center">
              <Info size={13} className="shrink-0 text-amber-600" />
              <span>PDF Estimate available for orders {formatPrice(minimumOrderAmount)} and above</span>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400">
          Direct factory billing • No online gateway required
        </p>

        {/* Continue shopping button */}
        <Link
          href="/#products"
          className="w-full flex items-center justify-center gap-2 border-2 border-amber-200/80 hover:border-red-400 bg-amber-50/50 hover:bg-red-50 text-gray-800 hover:text-red-700 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow active:scale-95 text-center group cursor-pointer"
        >
          <ArrowLeft size={16} className="text-red-600 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </aside>
  );
}
