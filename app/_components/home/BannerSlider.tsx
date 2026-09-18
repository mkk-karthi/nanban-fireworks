"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import AOS from "aos";
import { BANNER_SLIDES } from "../../_lib/constants";

/**
 * Modern Banner Slider with reactive AOS typography animations,
 * pure Tailwind CSS styling, and smooth slide synchronization.
 */
export function BannerSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeRealIndex, setActiveRealIndex] = useState(0);

  useEffect(() => {
    AOS.refreshHard();
  }, [activeRealIndex]);

  return (
    <section
      className="relative w-full bg-red-950 overflow-hidden select-none group"
      aria-label="Hero banner"
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={700}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        pagination={{
          clickable: true,
        }}
        onSlideChange={(swiper) => {
          setActiveRealIndex(swiper.realIndex);
        }}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full h-65 sm:h-95 md:h-115 lg:h-130"
      >
        {BANNER_SLIDES.map((slide, index) => {
          const isActive = activeRealIndex === index;

          return (
            <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-transparent" />
              </div>

              {/* Slide Typography Content with Reactive AOS Animations */}
              <div className="absolute inset-0 flex items-center px-12 sm:px-16 md:px-20 max-w-4xl z-10">
                {isActive && (
                  <div
                    key={`slide-typography-${slide.id}-${activeRealIndex}`}
                    className="space-y-1.5 sm:space-y-3"
                  >
                    {/* Festive Pill Badge */}
                    <div data-aos="fade-right" data-aos-delay="100" data-aos-duration="600">
                      <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                        <Sparkles size={13} className="text-yellow-400 animate-pulse" />
                        <span>Sivakasi Direct Factory Sale</span>
                      </span>
                    </div>

                    {/* Main Headline */}
                    <h1
                      data-aos="fade-right"
                      data-aos-delay="200"
                      data-aos-duration="700"
                      className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md"
                    >
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p
                      data-aos="fade-right"
                      data-aos-delay="300"
                      data-aos-duration="700"
                      className="text-red-100 text-xs sm:text-base md:text-lg max-w-xl drop-shadow line-clamp-2"
                    >
                      {slide.subtitle}
                    </p>

                    {/* Call to Action Button */}
                    <div
                      data-aos="fade-right"
                      data-aos-delay="400"
                      data-aos-duration="600"
                      className="pt-1.5 sm:pt-4"
                    >
                      <a
                        href="#products"
                        className="group/cta inline-flex items-center gap-2 bg-linear-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-red-950 font-black px-5 sm:px-8 py-2 sm:py-3.5 rounded-full text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-yellow-500/30"
                      >
                        <span>{slide.cta}</span>
                        <ArrowRight
                          size={16}
                          strokeWidth={2.5}
                          className="text-red-950 transition-transform group-hover/cta:translate-x-1"
                        />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Theme-Colored Navigation Controls (Compact on mobile, full-size on tablet/desktop) */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous Slide"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-12 rounded-full bg-red-950/70 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-yellow-300 hover:text-yellow-100 border border-yellow-400/50 hover:border-yellow-300 shadow-lg shadow-black/40 hover:shadow-yellow-500/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-85 hover:opacity-100 group/nav"
      >
        <ChevronLeft
          size={18}
          strokeWidth={2.5}
          className="transition-transform duration-300 ease-out group-hover/nav:-translate-x-0.5 sm:scale-125"
        />
      </button>

      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next Slide"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-12 rounded-full bg-red-950/70 hover:bg-linear-to-br hover:from-red-600 hover:to-red-700 text-yellow-300 hover:text-yellow-100 border border-yellow-400/50 hover:border-yellow-300 shadow-lg shadow-black/40 hover:shadow-yellow-500/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-85 hover:opacity-100 group/nav"
      >
        <ChevronRight
          size={18}
          strokeWidth={2.5}
          className="transition-transform duration-300 ease-out group-hover/nav:translate-x-0.5 sm:scale-125"
        />
      </button>
    </section>
  );
}
