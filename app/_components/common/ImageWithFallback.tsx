/**
 * ImageWithFallback – wraps next/image with an onError handler.
 * When the remote image fails to load, renders a themed placeholder
 * with a Lucide Package icon instead of a broken image.
 *
 * Usage: drop-in replacement for next/image on product/gift-box cards.
 */
"use client";

import { useState, useCallback } from "react";
import Image, { type ImageProps } from "next/image";
import { Package } from "lucide-react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  /** Icon size for the fallback placeholder (default: 36) */
  fallbackIconSize?: number;
  /** Extra className applied to the fallback wrapper div */
  fallbackClassName?: string;
}

export function ImageWithFallback({
  fallbackIconSize = 36,
  fallbackClassName = "",
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed || !props.src) {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-amber-50 via-orange-50 to-red-50 ${fallbackClassName}`}
        aria-label={`${alt} – image unavailable`}
        role="img"
      >
        <Package
          size={fallbackIconSize}
          className="text-red-300"
          aria-hidden="true"
        />
        <span className="text-[10px] text-red-400 font-medium text-center px-3 leading-snug">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}
