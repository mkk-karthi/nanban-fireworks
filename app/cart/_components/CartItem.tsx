"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import { Trash2, Package } from "lucide-react";
import type { Product } from "../../_lib/types";
import { formatPrice } from "../../_lib/utils";
import { useCartStore } from "../../_store/cartStore";
import { QuantitySelector } from "../../_components/common/QuantitySelector";

interface CartItemProps {
  product: Product;
  quantity: number;
}

/**
 * Single cart item row with guaranteed uniform column alignment for
 * Quantity, Subtotal, and Remove button across all items.
 */
export const CartItem = memo(function CartItem({ product, quantity }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const handleIncrease = useCallback(
    () => updateQuantity(product.id, quantity + 1),
    [updateQuantity, product.id, quantity]
  );

  const handleDecrease = useCallback(
    () => updateQuantity(product.id, quantity - 1),
    [updateQuantity, product.id, quantity]
  );

  const handleRemove = useCallback(
    () => removeItem(product.id),
    [removeItem, product.id]
  );

  const images = product.images ?? [];
  const subtotal = product.discountedPrice * quantity;
  const actualSubtotal = product.actualPrice * quantity;
  const savings = actualSubtotal - subtotal;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-2xl border border-amber-100/90 shadow-sm hover:shadow-md transition-shadow p-3.5 sm:p-4">

      {/* Left column: Image + Product Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Product image */}
        <div className="relative size-16 sm:size-20 shrink-0 rounded-xl overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 border border-amber-100">
          {images.length > 0 ? (
            <Image
              src={images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={26} className="text-red-300" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Category badges */}
          <div className="flex gap-1 flex-wrap">
            {product.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-[10px] bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-md font-bold"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Product Name (Full title without truncate) */}
          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug" title={product.name}>
            {product.name}
          </h3>

          {/* Unit price */}
          <div className="flex items-baseline gap-2 text-xs sm:text-sm">
            <span className="font-extrabold text-red-600">
              {formatPrice(product.discountedPrice)}
            </span>
            {product.actualPrice > product.discountedPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.actualPrice)}
              </span>
            )}
            <span className="text-[11px] text-gray-400">/ unit</span>
          </div>
        </div>
      </div>

      {/* Right column: Fixed Alignment for Qty, Subtotal & Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-amber-100/60 shrink-0">

        {/* 1. Quantity Selector */}
        <div className="shrink-0">
          <QuantitySelector
            quantity={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            min={1}
            size="sm"
          />
        </div>

        {/* 2. Subtotal (Fixed width column for exact vertical alignment across rows) */}
        <div className="w-24 sm:w-28 text-right shrink-0">
          <span className="block text-sm sm:text-base font-black text-gray-900">
            {formatPrice(subtotal)}
          </span>
          {savings > 0 && (
            <span className="block text-[10px] text-green-600 font-bold">
              Save {formatPrice(savings)}
            </span>
          )}
        </div>

        {/* 3. Remove Button (Fixed width column for identical vertical alignment) */}
        <div className="w-9 shrink-0 flex justify-end">
          <button
            onClick={handleRemove}
            aria-label={`Remove ${product.name} from cart`}
            className="size-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
            title="Remove item"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        </div>

      </div>
    </div>
  );
});
