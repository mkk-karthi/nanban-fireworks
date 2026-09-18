"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ShoppingCart, Sparkles, Truck, AlertTriangle } from "lucide-react";
import { BRAND, ORDER_CONFIG } from "../../_lib/constants";
import { useCartStore } from "../../_store/cartStore";

/**
 * Site-wide header with brand logo, contact info, and cart link.
 * Shown on all pages via root layout.
 */
export function Header() {
  const totalUnits = useCartStore((state) => state.getTotalUnits());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  return (
    <header className="bg-linear-to-r from-red-800 via-red-700 to-red-600 text-white shadow-lg shadow-red-900/30 sticky top-0 z-30">

      {/* Optional Orders Closed Notification Banner */}
      {!ORDER_CONFIG.isOrderingEnabled && (
        <div className="bg-yellow-400 text-red-950 px-4 py-1.5 text-xs font-black flex items-center justify-center gap-2 border-b border-yellow-500 shadow-inner">
          <AlertTriangle size={15} className="text-red-900 shrink-0" />
          <span>Notice: Online bookings are currently paused. Factory dispatch will resume shortly.</span>
        </div>
      )}

      {/* Top Contact Bar */}
      <div className="bg-red-900/60 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-red-100">
            {/* Email */}
            <a
              href={`mailto:${BRAND.email}`}
              className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              aria-label="Email us"
            >
              <Mail size={12} />
              <span>{BRAND.email}</span>
            </a>

            {/* Phone */}
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              aria-label="Call us"
            >
              <Phone size={12} />
              <span>{BRAND.phone}</span>
            </a>

            {/* Address */}
            <span className="hidden md:flex items-center gap-1.5 text-red-200">
              <MapPin size={12} />
              <span>{BRAND.address}</span>
            </span>
          </div>

          <p className="text-red-200 hidden sm:flex items-center gap-1.5">
            <Truck size={13} className="text-yellow-300" />
            <span>Free delivery above ₹5,000</span>
          </p>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="MKK Fireworks – home"
        >
          {/* Animated icon */}
          <div className="size-10 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500
            flex items-center justify-center shadow-md shadow-orange-700/40
            group-hover:scale-110 transition-transform duration-300">
            <Sparkles size={22} className="text-red-800" strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              MKK{" "}
              <span className="text-yellow-400">Fireworks</span>
            </h1>
            <p className="text-[11px] text-red-200 font-medium leading-tight mt-0.5">
              Light Up Your Celebrations!
            </p>
          </div>
        </Link>

        {/* Cart Link */}
        <Link
          href="/cart"
          aria-label={`Cart – ${hasHydrated ? totalUnits : 0} items`}
          className="relative flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300
            text-red-800 font-bold px-4 py-2 rounded-full
            transition-all duration-300 hover:scale-105 active:scale-95
            shadow-md shadow-yellow-600/30 text-sm"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Cart</span>

          {/* Item count badge */}
          {hasHydrated && totalUnits > 0 && (
            <span className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-700 text-white
              text-[11px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
              {totalUnits > 99 ? "99+" : totalUnits}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
