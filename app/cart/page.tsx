"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Sparkles, Trash2, ArrowLeft } from "lucide-react";
import productsData from "../_data/products.json";
import giftBoxesData from "../_data/giftBoxes.json";
import { ProductSchema } from "../_lib/types";
import { computeCartTotals } from "../_lib/utils";
import { useCartStore } from "../_store/cartStore";
import { generateEstimatePdf } from "../_lib/pdfGenerator";
import { CartItem } from "./_components/CartItem";
import { CartSummary } from "./_components/CartSummary";
import { OrderModal } from "./_components/OrderModal";

// Unified catalog lookup (Regular items + Gift boxes)
const allCatalogProducts = [
  ...productsData.map((p) => ProductSchema.parse(p)),
  ...giftBoxesData.map((p) => ProductSchema.parse(p)),
];

/**
 * Cart page – client component (reads from Zustand/localStorage).
 * Lists cart items, shows order totals, enforces ₹3,000 minimum,
 * generates branded festive PDF estimate and handles streamlined checkout.
 */
export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Resolve full product objects for cart items
  const cartProducts = useMemo(
    () =>
      items
        .map((item) => {
          const product = allCatalogProducts.find((p) => p.id === item.productId);
          return product ? { product, quantity: item.quantity } : null;
        })
        .filter(
          (entry): entry is { product: (typeof allCatalogProducts)[0]; quantity: number } =>
            entry !== null,
        ),
    [items],
  );

  // Compute totals
  const totals = useMemo(() => computeCartTotals(items, allCatalogProducts), [items]);

  const handleGenerateEstimate = () => {
    generateEstimatePdf(cartProducts, totals);
  };

  // Loading skeleton while Zustand hydrates
  if (!hasHydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-amber-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartProducts.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
        <div className="size-24 bg-red-100 rounded-full flex items-center justify-center">
          <ShoppingBag size={42} className="text-red-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm">
            Add some fireworks to light up your celebration!
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-linear-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white
            font-bold px-8 py-3 rounded-full transition-all duration-200
            hover:scale-105 active:scale-95 shadow-lg shadow-red-200"
        >
          <Sparkles size={18} strokeWidth={2} />
          Shop Fireworks
        </Link>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top action bar & heading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-red-600" size={28} />
              <span>Shopping <span className="text-red-600">Cart</span></span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {cartProducts.length} product(s) · {items.reduce((s, i) => s + i.quantity, 0)} items
            selected
          </p>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-colors font-semibold cursor-pointer"
        >
          <Trash2 size={14} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Cart items list */}
        <section className="space-y-3.5" aria-label="Cart items">
          {cartProducts.map(({ product, quantity }) => (
            <CartItem key={product.id} product={product} quantity={quantity} />
          ))}

          {/* Bottom items action bar */}
          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100/80 border border-red-200 px-4 py-2.5 rounded-xl transition-all shadow-xs group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
              <span>Add More Fireworks</span>
            </Link>
          </div>
        </section>

        {/* Order summary sidebar */}
        <div>
          <CartSummary
            actualTotal={totals.actualTotal}
            discountedTotal={totals.discountedTotal}
            totalSaved={totals.totalSaved}
            itemCount={cartProducts.length}
            onCheckout={() => setIsOrderModalOpen(true)}
            onGenerateEstimate={handleGenerateEstimate}
          />
        </div>
      </div>

      {/* Checkout & Email Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={cartProducts}
        totals={totals}
        onOrderSuccess={() => {
          clearCart();
        }}
      />
    </div>
  );
}
