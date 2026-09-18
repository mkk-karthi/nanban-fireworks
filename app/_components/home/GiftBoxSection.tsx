"use client";

import { memo, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import {
  Gift,
  ShoppingCart,
  CheckCircle2,
  Package,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import type { Product } from "../../_lib/types";
import { formatPrice, getDiscountPercent } from "../../_lib/utils";
import { useCartStore } from "../../_store/cartStore";
import { Lightbox, LightboxTrigger } from "../common/Lightbox";

interface GiftBoxCardProps {
  box: Product;
}

/** Individual gift box card – equal height design with reactive quantity controls. */
const GiftBoxCard = memo(function GiftBoxCard({ box }: GiftBoxCardProps) {
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const rawCartQty = useCartStore((s) => {
    const item = s.items.find((i) => i.productId === box.id);
    return item ? item.quantity : 0;
  });
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const currentQty = hasHydrated ? rawCartQty : 0;
  const isInCart = currentQty > 0;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const images = box.images ?? [];
  const discountPercent = getDiscountPercent(box.actualPrice, box.discountedPrice);

  const handleIncrease = useCallback(() => {
    updateQuantity(box.id, currentQty + 1);
  }, [updateQuantity, box.id, currentQty]);

  const handleDecrease = useCallback(() => {
    if (currentQty > 0) {
      updateQuantity(box.id, currentQty - 1);
    }
  }, [updateQuantity, box.id, currentQty]);

  const handleAdd = useCallback(() => updateQuantity(box.id, 1), [updateQuantity, box.id]);

  return (
    <>
      <div
        className={`group relative h-full rounded-2xl transition-all duration-300 flex flex-col overflow-hidden select-none border-2 ${
          isInCart
            ? "border-red-500 ring-4 ring-red-500/15 shadow-md shadow-red-500/15 bg-linear-to-b from-amber-50/60 via-white to-white"
            : "border-yellow-300 hover:border-yellow-400 bg-white shadow-xs hover:shadow-lg hover:shadow-amber-500/10"
        }`}
      >
        {/* Gift label */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-linear-to-r from-yellow-400 to-amber-500 text-red-950 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
          <Gift size={11} strokeWidth={2.5} />
          <span>COMBO</span>
        </div>

        {/* In-cart status badge for Gift Box */}
        {isInCart && (
          <span className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-linear-to-r from-red-600 via-red-700 to-amber-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-white/50 ring-2 ring-red-500/20">
            <CheckCircle2 size={11} strokeWidth={2.5} className="text-yellow-300" />
            <span>{currentQty} in Cart</span>
          </span>
        )}

        {/* Image */}
        <div
          className="relative aspect-4/3 w-full bg-linear-to-br from-amber-50 to-yellow-100 overflow-hidden cursor-pointer shrink-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (images.length > 0) setLightboxOpen(true);
          }}
        >
          {images.length > 0 ? (
            <>
              <Image
                src={images[0]}
                alt={box.name}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              {/* Subtle hover gradient aura */}
              <div className="absolute inset-0 bg-linear-to-t from-red-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={40} className="text-yellow-400" />
            </div>
          )}

          {images.length > 0 && <LightboxTrigger onClick={() => setLightboxOpen(true)} />}

          {/* Discount tag */}
          {discountPercent > 0 && (
            <span className="absolute bottom-2 right-2 z-10 bg-red-600 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Card Body (Equal height flex container with clean compact spacing) */}
        <div className="p-2.5 sm:p-3.5 flex flex-col flex-1">
          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-1">
            {box.category
              .filter((c) => c !== "Gift Box")
              .slice(0, 2)
              .map((cat) => (
                <span
                  key={cat}
                  className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded"
                >
                  {cat}
                </span>
              ))}
          </div>

          <h3 className="font-black text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-red-600 transition-colors min-h-8 sm:min-h-9 flex items-start">
            {box.name}
          </h3>

          {/* Pricing & Add to Cart button (pinned to bottom) */}
          <div className="pt-2 border-t border-amber-100/80 mt-auto space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-red-700">
                {formatPrice(box.discountedPrice)}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                {formatPrice(box.actualPrice)}
              </span>
            </div>

            {/* Controls: Full-width adaptive Add Combo or Stepper */}
            <div className="h-8 sm:h-9 w-full">
              {!isInCart ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  aria-label={`Add ${box.name} combo to cart`}
                  className="w-full h-full flex items-center justify-center gap-1 bg-linear-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-[11px] sm:text-xs font-bold px-2 rounded-xl transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md cursor-pointer select-none"
                >
                  <ShoppingCart size={13} strokeWidth={2.5} />
                  <span>Add Combo</span>
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
      </div>

      <Lightbox
        images={images}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={box.name}
      />
    </>
  );
});

// Section

interface GiftBoxSectionProps {
  giftBoxes: Product[];
}

/**
 * Gift Box showcase using Swiper slider for smooth touch and mouse navigation,
 * responsive cards, and AOS entrance animations.
 */
export function GiftBoxSection({ giftBoxes }: GiftBoxSectionProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  if (giftBoxes.length === 0) return null;

  return (
    <section className="py-10 bg-linear-to-b from-amber-50/70 via-white to-amber-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div
          data-aos="fade-down"
          data-aos-duration="600"
          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 bg-linear-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0">
              <Gift size={22} className="text-red-950" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Curated <span className="text-red-600">Gift Box Combos</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                All-in-one family assortments at wholesale factory rates
              </p>
            </div>
          </div>

          {/* Horizontally scrollable price tags on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto py-1 shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x overscroll-x-contain">
            {["₹99", "₹499", "₹1,999", "₹4,999"].map((p) => (
              <span
                key={p}
                className="text-xs font-extrabold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 whitespace-nowrap shrink-0 shadow-xs"
              >
                From {p}
              </span>
            ))}
          </div>
        </div>

        {/* Swiper Carousel with Custom Floating Navigation */}
        <div data-aos="fade-up" data-aos-duration="700" className="relative group/carousel">
          <Swiper
            modules={[Autoplay, Pagination]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={12}
            slidesPerView={2}
            loop={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 14 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="giftbox-swiper pb-12! pt-3! overflow-hidden items-stretch"
          >
            {giftBoxes.map((box) => (
              <SwiperSlide key={box.id} className="h-auto pb-2 flex flex-col">
                <GiftBoxCard box={box} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Floating Side Navigation Controls (Visible on mobile & desktop) */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous Gift Box"
            className="flex absolute -left-1.5 sm:-left-3 lg:-left-4 top-2/5 -translate-y-1/2 z-20 size-8 sm:size-10 lg:size-11 rounded-full bg-white/95 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-red-600 hover:text-yellow-200 border-2 border-amber-300 hover:border-yellow-400 shadow-md sm:shadow-lg shadow-amber-900/15 hover:shadow-xl hover:shadow-red-500/25 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer opacity-95 hover:opacity-100 group/sidebtn backdrop-blur-xs"
          >
            <ChevronLeft
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-300 ease-out group-hover/sidebtn:-translate-x-0.5"
            />
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next Gift Box"
            className="flex absolute -right-1.5 sm:-right-3 lg:-right-4 top-2/5 -translate-y-1/2 z-20 size-8 sm:size-10 lg:size-11 rounded-full bg-white/95 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-red-600 hover:text-yellow-200 border-2 border-amber-300 hover:border-yellow-400 shadow-md sm:shadow-lg shadow-amber-900/15 hover:shadow-xl hover:shadow-red-500/25 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer opacity-95 hover:opacity-100 group/sidebtn backdrop-blur-xs"
          >
            <ChevronRight
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-300 ease-out group-hover/sidebtn:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
