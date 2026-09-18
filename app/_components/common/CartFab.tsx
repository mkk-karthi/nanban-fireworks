"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../_store/cartStore";

/**
 * Floating Action Button powered by framer-motion that pops into view
 * only on the product list page whenever items are in the cart.
 * Automatically hidden on the cart page.
 */
export function CartFab() {
  const pathname = usePathname();
  const totalUnits = useCartStore((state) => state.getTotalUnits());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  // Only show on product list page ('/') and hide when empty or on cart page
  if (!hasHydrated || totalUnits === 0 || pathname !== "/") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: 30 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40"
      >
        <Link
          href="/cart"
          aria-label={`View cart – ${totalUnits} items`}
          className="flex items-center gap-2 sm:gap-2.5 bg-linear-to-r from-red-600 via-red-700 to-amber-600 text-white pl-3.5 pr-4 py-2.5 sm:pl-4 sm:pr-5 sm:py-3 rounded-full shadow-2xl shadow-red-600/40 hover:from-red-700 hover:to-amber-700 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-yellow-400/80"
        >
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={2.2} />
            {/* Animated Quantity Badge */}
            <motion.span
              key={totalUnits}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute -top-2.5 -right-2.5 min-w-5 h-5 bg-yellow-400 text-red-950 text-[11px] font-black rounded-full flex items-center justify-center px-1 shadow-md"
            >
              {totalUnits > 99 ? "99+" : totalUnits}
            </motion.span>
          </div>
          <span className="text-sm font-extrabold tracking-wide">View Cart</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
