"use client";

import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart, Package, Minus, Plus } from "lucide-react";
import { formatPrice } from "../../_lib/utils";
import { useCartStore } from "../../_store/cartStore";
import type { Product } from "../../_lib/types";
import { Lightbox, LightboxTrigger } from "../common/Lightbox";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * Product Card component with uniform height across grid rows,
 * reactive cart quantity controls starting at 0 by default,
 * multi-image full-window lightbox launcher, and AOS scroll animations.
 */
export const ProductCard = memo(function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Direct reactive Cart store selector
  const rawCartQty = useCartStore((s) => {
    const item = s.items.find((i) => i.productId === product.id);
    return item ? item.quantity : 0;
  });
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const currentQty = mounted ? rawCartQty : 0;
  const isInCart = currentQty > 0;

  // Compute discount percentage
  const discountPercent =
    product.discountedPrice && product.discountedPrice < product.actualPrice
      ? Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)
      : 0;

  const images = product.images ?? [];

  // Lightbox handlers
  const openLightbox = useCallback(
    (idx: number = 0) => {
      if (images.length === 0) return;
      setLightboxIndex(idx);
      setLightboxOpen(true);
    },
    [images.length],
  );

  // Direct Cart Quantity Handlers
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

  return (
    <>
      <article
        className={`group relative rounded-2xl transition-all duration-300 flex flex-col h-full overflow-hidden border-2 border-amber-200/90 hover:border-amber-400/90 bg-white shadow-xs hover:shadow-lg hover:shadow-amber-500/10`}
      >
        {/* 1. Top Section: Product Image */}
        <div
          className={`relative aspect-square w-full bg-linear-to-br from-amber-50 to-orange-50 overflow-hidden shrink-0 ${
            images.length > 0 ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (images.length > 0) openLightbox(0);
          }}
        >
          {images.length > 0 ? (
            <>
              {/* Skeleton shimmer while image loads */}
              {!imageLoaded && <div className="absolute inset-0 bg-amber-100/60 animate-pulse" />}
              <Image
                src={images[0]}
                alt={product.name}
                fill
                loading={priority ? "eager" : "lazy"}
                priority={priority}
                className={`object-cover group-hover:scale-108 transition-transform duration-500 ease-out ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                onLoad={() => setImageLoaded(true)}
              />
              {/* Subtle hover gradient aura */}
              <div className="absolute inset-0 bg-linear-to-t from-red-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-red-50 via-amber-50 to-orange-50">
              <Package size={36} className="text-red-300" />
              <p className="text-[11px] text-red-400 font-medium text-center px-3">
                {product.name}
              </p>
            </div>
          )}

          {/* Lightbox zoom trigger button */}
          {images.length > 0 && <LightboxTrigger onClick={() => openLightbox(0)} />}

          {/* Multi-image count pill */}
          {images.length > 1 && (
            <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
              +{images.length - 1} photos
            </span>
          )}

          {/* Discount badge */}
          {discountPercent > 0 && (
            <span className="absolute bottom-2 left-2 z-10 bg-linear-to-r from-red-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* 2. Card Content (Equal height body with clean compact spacing) */}
        <div className="flex flex-col flex-1 p-2.5 sm:p-3">
          {/* Category tag */}
          <div className="flex flex-wrap gap-1 mb-1">
            {product.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold tracking-wide"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Product title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug group-hover:text-red-600 transition-colors min-h-8 sm:min-h-9 flex items-start">
            {product.name}
          </h3>

          {/* 3. Bottom Pricing & Actions (Always pinned to bottom) */}
          <div className="pt-2 border-t border-amber-100/80 mt-auto space-y-1.5">
            {/* Price display (Styled identical to GiftBoxCard) */}
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-red-700">
                {formatPrice(product.discountedPrice)}
              </span>
              {product.actualPrice > product.discountedPrice && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>

            {/* Controls: Full-width adaptive Add to Cart or Stepper (Matching GiftBoxCard rounded-xl style) */}
            <div className="h-8 sm:h-9 w-full">
              {!isInCart ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={`Add ${product.name} to cart`}
                  className="w-full h-full flex items-center justify-center gap-1.5 bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-[11px] sm:text-xs font-bold px-2 rounded-xl transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md cursor-pointer select-none"
                >
                  <ShoppingCart size={13} strokeWidth={2.5} />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-between bg-red-50/90 border border-red-300 rounded-xl px-1 shadow-xs">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                    className="size-7 flex items-center justify-center rounded-lg bg-white hover:bg-red-600 text-red-700 hover:text-white border border-red-200 shadow-xs transition-colors active:scale-90 cursor-pointer shrink-0"
                  >
                    <Minus size={13} strokeWidth={3} />
                  </button>

                  <span className="text-xs font-black text-red-700 select-none px-1 truncate">
                    {currentQty} in Cart
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                    className="size-7 flex items-center justify-center rounded-lg bg-yellow-400 hover:bg-yellow-500 text-red-950 font-bold shadow-xs transition-colors active:scale-90 cursor-pointer shrink-0"
                  >
                    <Plus size={13} strokeWidth={3} />
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
