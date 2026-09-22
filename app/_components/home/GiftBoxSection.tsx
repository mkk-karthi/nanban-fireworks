"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import { Gift, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../../_lib/types";
import { ProductCard } from "./ProductCard";
import { usePrefersReducedMotion } from "../../_hooks/usePrefersReducedMotion";

interface GiftBoxSectionProps {
  giftBoxes: Product[];
}

/**
 * Gift Box showcase using Swiper slider for smooth touch and mouse navigation,
 * unified ProductCard components, and AOS entrance animations.
 *
 * A11y: aria-roledescription="carousel", aria-label on section and slides.
 * Performance: autoplay disabled when prefers-reduced-motion is active.
 */
export function GiftBoxSection({ giftBoxes }: GiftBoxSectionProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (giftBoxes.length === 0) return null;

  return (
    <section
      className="py-10 bg-linear-to-b from-amber-50/70 via-white to-amber-50/30 overflow-hidden"
      aria-label="Curated Gift Box Combos"
      aria-roledescription="carousel"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div
          data-aos="fade-down"
          data-aos-duration="600"
          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div
              className="size-11 bg-linear-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0"
              aria-hidden="true"
            >
              <Gift size={22} className="text-red-950" strokeWidth={2.5} aria-hidden="true" />
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
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto py-1 shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x overscroll-x-contain"
            aria-label="Price ranges"
          >
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
            modules={[Autoplay, Pagination, A11y]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={12}
            slidesPerView={2}
            loop={true}
            pagination={{ clickable: true }}
            autoplay={
              prefersReducedMotion
                ? false
                : { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
            }
            speed={prefersReducedMotion ? 0 : 500}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 14 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="giftbox-swiper pb-12! pt-3! overflow-hidden items-stretch"
            a11y={{
              prevSlideMessage: "Previous gift box",
              nextSlideMessage: "Next gift box",
            }}
          >
            {giftBoxes.map((box, index) => (
              <SwiperSlide
                key={box.id}
                className="h-auto pb-2 flex flex-col"
                role="group"
                aria-roledescription="slide"
                aria-label={`Gift box ${index + 1} of ${giftBoxes.length}`}
              >
                <ProductCard
                  product={box}
                  variant="giftBox"
                  index={index}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Floating Side Navigation Controls */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous gift box"
            className="flex absolute -left-1.5 sm:-left-3 lg:-left-4 top-2/5 -translate-y-1/2 z-20 size-8 sm:size-10 lg:size-11 rounded-full bg-white/95 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-red-600 hover:text-yellow-200 border-2 border-amber-300 hover:border-yellow-400 shadow-md sm:shadow-lg shadow-amber-900/15 hover:shadow-xl hover:shadow-red-500/25 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer opacity-95 hover:opacity-100 group/sidebtn backdrop-blur-xs"
          >
            <ChevronLeft
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-300 ease-out group-hover/sidebtn:-translate-x-0.5"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next gift box"
            className="flex absolute -right-1.5 sm:-right-3 lg:-right-4 top-2/5 -translate-y-1/2 z-20 size-8 sm:size-10 lg:size-11 rounded-full bg-white/95 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-red-600 hover:text-yellow-200 border-2 border-amber-300 hover:border-yellow-400 shadow-md sm:shadow-lg shadow-amber-900/15 hover:shadow-xl hover:shadow-red-500/25 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer opacity-95 hover:opacity-100 group/sidebtn backdrop-blur-xs"
          >
            <ChevronRight
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-300 ease-out group-hover/sidebtn:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
