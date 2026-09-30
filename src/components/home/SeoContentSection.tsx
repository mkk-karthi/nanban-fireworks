"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Truck,
  FileText,
  PhoneCall,
  PackageCheck,
  ChevronDown,
  BadgePercent,
  Sparkles,
} from "lucide-react";
import { FAQ_LIST } from "@/data/faqs";

export function SeoContentSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="about-wholesale"
      aria-label="Sivakasi wholesale crackers details and frequently asked questions"
      className="py-14 bg-linear-to-b from-white via-amber-50/50 to-white border-t border-amber-200/60"
    >
      <div className="max-w-7xl mx-auto px-4 space-y-16">
        {/* Section 1: Sivakasi Factory Direct Features */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              <Sparkles size={14} className="text-red-700" aria-hidden="true" />
              <span>Sivakasi Direct Factory Advantage</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Buy Sivakasi Crackers Online at <span className="text-red-700">Wholesale Prices</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              Nanban Crackers brings Sivakasi&apos;s celebrated fireworks tradition straight to your
              doorstep across Tamil Nadu, Kerala, and Bangalore. Experience premium aerial repeaters,
              dazzling sparklers, and festive gift boxes with genuine direct factory savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="size-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mb-4">
                <BadgePercent size={26} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Flat 90% Wholesale Off</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Enjoy transparent Sivakasi factory-rate pricing with up to 90% discount on 100+
                crackers, sky fancy, and gift combos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="size-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Truck size={26} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">TN, Kerala & Bangalore</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Free transport parcel dispatch to transport hubs across Tamil Nadu, Kerala, and Bangalore
                for orders above ₹3,000.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="size-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck size={26} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">100% Genuine Quality</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Direct factory-fresh crackers manufactured in Sivakasi with vibrant colors,
                delightful sparkles, and festive performance.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="size-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <FileText size={26} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Instant PDF Estimate</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Generate and download formal branded estimates with detailed price breakdowns with a
                single click.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How It Works */}
        <div className="bg-linear-to-br from-red-900 via-red-800 to-amber-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-yellow-400 text-xs font-black uppercase tracking-widest block mb-2">
              Simple & Safe Ordering
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              How to Order Fireworks in 3 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-4">
              <div className="size-14 rounded-2xl bg-yellow-400 text-red-950 font-black text-xl flex items-center justify-center mb-4 shadow-lg">
                1
              </div>
              <div className="flex items-center gap-2 font-black text-lg mb-2">
                <PackageCheck size={20} className="text-yellow-300" aria-hidden="true" />
                <span>Choose Your Crackers</span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                Explore our catalog of 100+ single items or 14 family gift boxes. Add your
                requirements to cart (minimum ₹3,000).
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="size-14 rounded-2xl bg-yellow-400 text-red-950 font-black text-xl flex items-center justify-center mb-4 shadow-lg">
                2
              </div>
              <div className="flex items-center gap-2 font-black text-lg mb-2">
                <FileText size={20} className="text-yellow-300" aria-hidden="true" />
                <span>Get Instant Estimate</span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                Review your discount savings and generate a festive PDF estimate or submit your order
                form with delivery details.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="size-14 rounded-2xl bg-yellow-400 text-red-950 font-black text-xl flex items-center justify-center mb-4 shadow-lg">
                3
              </div>
              <div className="flex items-center gap-2 font-black text-lg mb-2">
                <PhoneCall size={20} className="text-yellow-300" aria-hidden="true" />
                <span>Confirm & Dispatch</span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                Our Sivakasi logistics desk verifies your order via WhatsApp/Call and dispatches it
                safely to your nearest transport hub.
              </p>
            </div>
          </div>
        </div>



        {/* Section 4: Frequently Asked Questions (FAQ) */}
        <div id="faq" className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Everything you need to know about buying crackers online from Sivakasi
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-amber-200/90 rounded-2xl bg-white overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left font-black text-gray-900 flex items-center justify-between gap-4 hover:bg-amber-50/50 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-red-700 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-amber-100 bg-amber-50/30"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
