"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, ShoppingCart, Truck, AlertTriangle } from "lucide-react";
import { COMPANY_DETAILS, ORDER_CONFIG } from "@/config/site";
import { useCartStore } from "@/store/cartStore";

/**
 * Site-wide header with brand logo, contact info, and cart link.
 * Shown on all pages via root layout.
 */
export function Header() {
  const totalUnits = useCartStore((state) => state.getTotalUnits());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  return (
    <header
      className="bg-linear-to-r from-red-800 via-red-700 to-red-600 text-white shadow-lg shadow-red-900/30 sticky top-0 z-30"
      role="banner"
    >
      {/* Optional Orders Closed Notification Banner */}
      {!ORDER_CONFIG.isOrderingEnabled && (
        <div
          className="bg-yellow-400 text-red-950 px-4 py-1.5 text-xs font-black flex items-center justify-center gap-2 border-b border-yellow-500 shadow-inner"
          role="alert"
        >
          <AlertTriangle size={15} className="text-red-900 shrink-0" aria-hidden="true" />
          <span>
            Notice: Online bookings are currently paused. Factory dispatch will resume shortly.
          </span>
        </div>
      )}

      {/* Top Contact Bar */}
      <div className="bg-red-900/60 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs">
          <address className="flex flex-wrap items-center gap-x-5 gap-y-1 text-red-100 not-italic">
            {/* Email */}
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              aria-label={`Email us at ${COMPANY_DETAILS.email}`}
            >
              <Mail size={12} aria-hidden="true" />
              <span>{COMPANY_DETAILS.email}</span>
            </a>

            {/* Phone */}
            <a
              href={`tel:${COMPANY_DETAILS.phoneClean}`}
              className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              aria-label={`Call us at ${COMPANY_DETAILS.phone}`}
            >
              <Phone size={12} aria-hidden="true" />
              <span>{COMPANY_DETAILS.phone}</span>
            </a>
          </address>

          <p className="text-red-200 hidden sm:flex items-center gap-1.5">
            <Truck size={13} className="text-yellow-300" aria-hidden="true" />
            <span>{ORDER_CONFIG.freeDeliveryText}</span>
          </p>
        </div>
      </div>

      {/* Main Header Row */}
      <nav
        className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
        aria-label="Primary navigation"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group"
          aria-label={`${COMPANY_DETAILS.name} – home`}
        >
          <div className="relative h-11 w-16 sm:h-12 sm:w-18 shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
            <Image
              src="/images/logo.webp"
              alt={`${COMPANY_DETAILS.name} logo`}
              fill
              className="object-contain"
              priority
              loading="eager"
              decoding="async"
              sizes="72px"
            />
          </div>

          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none block">
              Nanban <span className="text-yellow-400">Crackers</span>
            </span>
            <span className="text-[11px] text-red-200 font-medium leading-tight mt-0.5 block">
              {COMPANY_DETAILS.tagline}
            </span>
          </div>
        </Link>

        {/* Cart Link */}
        <Link
          href="/cart"
          prefetch={false}
          aria-label={`Shopping cart – ${hasHydrated ? totalUnits : 0} items`}
          className="relative flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300
            text-red-800 font-bold px-4 py-2 rounded-full
            transition-all duration-300 hover:scale-105 active:scale-95
            shadow-md shadow-yellow-600/30 text-sm cursor-pointer"
        >
          <ShoppingCart size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline">Cart</span>

          {/* Item count badge */}
          {hasHydrated && totalUnits > 0 && (
            <span
              className="absolute -top-2 -right-2 size-5 min-w-5 bg-red-700 text-white
              text-[11px] font-black rounded-full flex items-center justify-center px-1 shadow-md"
              aria-hidden="true"
            >
              {totalUnits > 99 ? "99+" : totalUnits}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
