"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { ShoppingCart, Minus, Plus, Gift } from "lucide-react";
import { formatPrice, getDiscountPercent } from "../../_lib/utils";
import { useCartStore } from "../../_store/cartStore";
import type { Product } from "../../_lib/types";
import { Lightbox, LightboxTrigger } from "../common/Lightbox";
import { ImageWithFallback } from "../common/ImageWithFallback";

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
  /** Explicit variant override ("giftBox" | "product"). If omitted, auto-detected from product categories. */
  variant?: "product" | "giftBox";
  /** Aspect ratio for product image: "square" (1:1, default for catalog) or "4/3" (default for gift boxes) */
  aspectRatio?: "square" | "4/3";
  /** Optional extra wrapper className */
  className?: string;
}

/**
 * Unified Card Component for both catalog Products and Gift Box Combos.
 *
 * Features:
 * - Uniform card height across grid and carousel layouts (`flex flex-col h-full`).
 * - Reactive cart quantity controls starting at 0 by default, syncing with Zustand.
 * - Dynamic combo badges, discount tags, and multi-image photo counter pills.
 * - Multi-image full-window Lightbox launcher.
 * - Graceful image fallback placeholder via ImageWithFallback.
 * - Full ARIA and keyboard accessibility.
 */
export const ProductCard = memo(function ProductCard({
  product,
  priority = false,
  index = 0,
  variant,
  aspectRatio,
  className = "",
}: ProductCardProps) {
  const isGiftBox = variant === "giftBox" || (!variant && product.category.includes("Gift Box"));

  const imgAspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "4/3" || isGiftBox
        ? "aspect-4/3"
        : "aspect-square";

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Zustand persistent cart state
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const rawCartQty = useCartStore((s) => {
    const item = s.items.find((i) => i.productId === product.id);
    return item ? item.quantity : 0;
  });
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const currentQty = hasHydrated ? rawCartQty : 0;
  const isInCart = currentQty > 0;

  // Memoized discount calculation
  const discountPercent = useMemo(
    () => getDiscountPercent(product.actualPrice, product.discountedPrice),
    [product.actualPrice, product.discountedPrice],
  );

  const images = product.images ?? [];

  // Filter categories to display
  const displayCategories = useMemo(() => {
    if (isGiftBox) {
      const filtered = product.category.filter((c) => c !== "Gift Box");
      return (filtered.length > 0 ? filtered : product.category).slice(0, 2);
    }
    return product.category.slice(0, 2);
  }, [product.category, isGiftBox]);

  // Lightbox handlers
  const openLightbox = useCallback(
    (idx: number = 0) => {
      if (images.length === 0) return;
      setLightboxIndex(idx);
      setLightboxOpen(true);
    },
    [images.length],
  );

  // Cart quantity handlers
  const handleIncrease = useCallback(() => {
    updateQuantity(product.id, currentQty + 1);
  }, [updateQuantity, product.id, currentQty]);

  const handleDecrease = useCallback(() => {
    if (currentQty > 0) {
      updateQuantity(product.id, currentQty - 1);
    }
  }, [updateQuantity, product.id, currentQty]);

  const handleAddToCart = useCallback(() => {
    updateQuantity(product.id, 1);
  }, [updateQuantity, product.id]);

  const isPriority = priority || index < 3;

  return (
    <>
      <article
        className={`group relative rounded-2xl transition-all duration-300 flex flex-col h-full overflow-hidden select-none border-2 ${
          isInCart
            ? "border-red-500 ring-4 ring-red-500/15 shadow-md shadow-red-500/15 bg-linear-to-b from-amber-50/60 via-white to-white"
            : "border-yellow-300 hover:border-yellow-400 bg-white shadow-xs hover:shadow-lg hover:shadow-amber-500/10"
        } ${className}`}
        aria-label={product.name}
      >
        {/* 1. Gift Box Combo Badge (Top-Left) */}
        {isGiftBox && (
          <div
            className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-linear-to-r from-yellow-400 to-amber-500 text-red-950 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md"
            aria-label="Gift combo"
          >
            <Gift size={11} strokeWidth={2.5} aria-hidden="true" />
            <span>COMBO</span>
          </div>
        )}

        {/* 2. Product Image Container */}
        <div
          className={`relative ${imgAspectClass} w-full bg-linear-to-br from-amber-50 via-orange-50/40 to-yellow-100 overflow-hidden shrink-0 ${
            images.length > 0 ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (images.length > 0) openLightbox(0);
          }}
          role={images.length > 0 ? "button" : undefined}
          aria-label={images.length > 0 ? `View ${product.name} images` : undefined}
          tabIndex={images.length > 0 ? 0 : undefined}
          onKeyDown={(e) => {
            if (images.length > 0 && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              openLightbox(0);
            }
          }}
        >
          {images.length > 0 ? (
            <>
              <ImageWithFallback
                src={images[0]}
                alt={product.name}
                fill
                loading={isPriority ? "eager" : "lazy"}
                priority={isPriority}
                className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                fallbackIconSize={40}
              />
              {/* Subtle hover gradient aura */}
              <div className="absolute inset-0 bg-linear-to-t from-red-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </>
          ) : (
            <ImageWithFallback src="" alt={product.name} fill fallbackIconSize={40} />
          )}

          {/* Lightbox zoom trigger button */}
          {images.length > 0 && <LightboxTrigger onClick={() => openLightbox(0)} />}

          {/* Multi-image count pill (for regular products with > 1 photo) */}
          {!isGiftBox && images.length > 1 && (
            <span
              className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs"
              aria-label={`${images.length} photos available`}
            >
              +{images.length - 1} photos
            </span>
          )}

          {/* Discount badge */}
          {discountPercent > 0 && (
            <span
              className={`absolute bottom-2 ${
                isGiftBox ? "right-2" : "left-2"
              } z-10 bg-linear-to-r from-red-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md`}
              aria-label={`${discountPercent}% discount`}
            >
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* 3. Card Body */}
        <div className="flex flex-col flex-1 p-2.5 sm:p-3.5">
          {/* Category tags */}
          <div className="flex flex-wrap gap-1 mb-1" aria-label="Categories">
            {displayCategories.map((cat) => (
              <span
                key={cat}
                className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded tracking-wide"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Product Title (uniform height across rows) */}
          <h3 className="font-black text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-red-600 transition-colors min-h-8 sm:min-h-9 flex items-start">
            {product.name}
          </h3>

          {/* 5. Bottom Pricing & Actions (Pinned to bottom) */}
          <div className="pt-2 border-t border-amber-100/80 mt-auto space-y-1.5">
            {/* Price display */}
            <div className="flex items-baseline justify-between">
              <span
                className="text-base sm:text-lg font-black text-red-700"
                aria-label={`Price: ${formatPrice(product.discountedPrice)}`}
              >
                {formatPrice(product.discountedPrice)}
              </span>
              {product.actualPrice > product.discountedPrice && (
                <span
                  className="text-[11px] sm:text-xs text-gray-400 line-through"
                  aria-label={`Original price: ${formatPrice(product.actualPrice)}`}
                >
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>

            {/* Controls: Full-width adaptive Add to Cart or Stepper */}
            <div className="h-8 sm:h-9 w-full">
              {!isInCart ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={
                    isGiftBox ? `Add ${product.name} combo to cart` : `Add ${product.name} to cart`
                  }
                  className="w-full h-full flex items-center justify-center gap-1.5 bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-[11px] sm:text-xs font-bold px-2 rounded-xl transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md cursor-pointer select-none"
                >
                  <ShoppingCart size={13} strokeWidth={2.5} aria-hidden="true" />
                  <span>{isGiftBox ? "Add Combo" : "Add to Cart"}</span>
                </button>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-between bg-red-50/90 border border-red-300 rounded-xl px-1 shadow-xs"
                  role="group"
                  aria-label={`${product.name} quantity: ${currentQty}`}
                >
                  <button
                    type="button"
                    onClick={handleDecrease}
                    aria-label={`Decrease ${product.name} quantity`}
                    className="size-7 flex items-center justify-center rounded-lg bg-white hover:bg-red-600 text-red-700 hover:text-white border border-red-200 shadow-xs transition-colors active:scale-90 cursor-pointer shrink-0"
                  >
                    <Minus size={13} strokeWidth={3} aria-hidden="true" />
                  </button>

                  <span
                    className="text-xs font-black text-red-700 select-none px-1 truncate"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {currentQty} in Cart
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    aria-label={`Increase ${product.name} quantity`}
                    className="size-7 flex items-center justify-center rounded-lg bg-yellow-400 hover:bg-yellow-500 text-red-950 font-bold shadow-xs transition-colors active:scale-90 cursor-pointer shrink-0"
                  >
                    <Plus size={13} strokeWidth={3} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Full Window Lightbox Portal (mounted in document.body) */}
      <Lightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={product.name}
      />
    </>
  );
});
