"use client";

import { useEffect, useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

const emptySubscribe = () => () => {};

/**
 * Image Lightbox Modal:
 * Matches OrderModal architecture and animations with spring entrance,
 * backdrop-blur, full keyboard & touch controls, and body scroll lock.
 */
export function Lightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productName,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Sync initial index when lightbox opens
  const [prevOpenState, setPrevOpenState] = useState(isOpen);
  if (isOpen !== prevOpenState) {
    setPrevOpenState(isOpen);
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (images.length > 1) {
        if (e.key === "ArrowRight") goNext();
        if (e.key === "ArrowLeft") goPrev();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, images.length, onClose, goNext, goPrev]);

  if (!isMounted || !isOpen || images.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-y-auto select-none"
          onClick={onClose}
        >
          <motion.div
            key="lightbox-card"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="relative w-full overflow-hidden my-auto h-dvh flex flex-col items-center select-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 max-w-5xl flex items-center justify-between w-full">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-yellow-400 leading-tight">
                  {productName}
                </h3>
                {images.length > 1 && (
                  <p className="text-red-100 text-xs mt-0.5 font-medium">
                    Photo {currentIndex + 1} of {images.length}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-red-600 text-white shadow-lg transition-all duration-200 active:scale-90 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Stage: Image Container */}
            <div className="relative w-full max-w-4xl flex items-center justify-center p-3 sm:p-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-full h-[60vh] sm:h-[68vh] flex items-center justify-center"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`${productName} – image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Left navigation arrow */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 sm:size-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-red-600 text-white shadow-lg transition-all duration-200 active:scale-90 cursor-pointer z-10"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Right navigation arrow */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 sm:size-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-red-600 text-white shadow-lg transition-all duration-200 active:scale-90 cursor-pointer z-10"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Thumbnail Strip (Only when multiple images) */}
            {images.length > 1 && (
              <div className="px-4 py-3 flex items-center justify-center gap-2 shrink-0 overflow-x-auto scrollbar-none w-full">
                {images.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative size-12 sm:size-14 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                      idx === currentIndex
                        ? "border-yellow-400 scale-105 shadow-md shadow-yellow-400/40"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// Trigger button (small zoom icon on product images)

interface LightboxTriggerProps {
  onClick: () => void;
}

export function LightboxTrigger({ onClick }: LightboxTriggerProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label="View full window image"
      className="absolute top-2 right-2 size-8 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 z-10 shadow-md cursor-pointer"
    >
      <ZoomIn size={16} />
    </button>
  );
}
