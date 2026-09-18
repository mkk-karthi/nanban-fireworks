"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  /** Size variant of the control */
  size?: "sm" | "md";
  disabled?: boolean;
}

/**
 * Reusable quantity selector with +/- buttons.
 * Defaults to 0 min so product list cards can start at 0 and directly increment into cart.
 */
export function QuantitySelector({
  quantity = 0,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = "sm",
  disabled = false,
}: QuantitySelectorProps) {
  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  const btnBase =
    "flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer";

  const sizeClasses = {
    sm: {
      btn: "size-7",
      icon: 13,
      text: "text-xs font-black w-8 text-center",
      container: "px-1 py-1 gap-1",
    },
    md: {
      btn: "size-8",
      icon: 15,
      text: "text-sm font-black w-9 text-center",
      container: "px-1.5 py-1 gap-1.5",
    },
  };

  const s = sizeClasses[size];

  return (
    <div
      className={`flex items-center ${s.container} bg-amber-50/90 border ${
        quantity > 0 ? "border-red-400 bg-red-50/40" : "border-amber-200"
      } rounded-full transition-colors`}
    >
      {/* Decrease button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrease();
        }}
        disabled={disabled || isAtMin}
        aria-label="Decrease quantity"
        className={`${btnBase} ${s.btn} ${
          isAtMin
            ? "bg-gray-100 text-gray-400"
            : "bg-red-100 hover:bg-red-600 text-red-700 hover:text-white"
        }`}
      >
        <Minus size={s.icon} strokeWidth={2.8} />
      </button>

      {/* Quantity number */}
      <span
        className={`${s.text} select-none ${
          quantity > 0 ? "text-red-700 font-black" : "text-gray-500 font-semibold"
        }`}
      >
        {quantity}
      </span>

      {/* Increase button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        disabled={disabled || isAtMax}
        aria-label="Increase quantity"
        className={`${btnBase} ${s.btn} bg-amber-200 hover:bg-amber-400 text-amber-950`}
      >
        <Plus size={s.icon} strokeWidth={2.8} />
      </button>
    </div>
  );
}
