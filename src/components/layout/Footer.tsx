import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Heart } from "lucide-react";
import { COMPANY_DETAILS } from "@/config/site";

/**
 * Site-wide footer shown on all pages via root layout.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-red-900 via-red-800 to-red-900 text-white mt-16" role="contentinfo">
      {/* Decorative top border */}
      <div className="h-1 bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-400" aria-hidden="true" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative h-11 w-16 shrink-0 drop-shadow-md">
              <Image
                src="/images/logo.webp"
                alt={`${COMPANY_DETAILS.name} logo`}
                fill
                className="object-contain"
                sizes="64px"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-lg font-black leading-none text-white">
                Nanban <span className="text-yellow-400">Crackers</span>
              </p>
              <p className="text-xs text-red-300 mt-1">{COMPANY_DETAILS.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-red-200 leading-relaxed max-w-xs">
            Premium quality fireworks, sparklers, and celebration accessories with Sivakasi Direct
            Sale, Tamil Nadu.
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-red-200">
            {[
              { label: "All Products", href: "/" },
              { label: "Shopping Cart", href: "/cart" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-yellow-500" aria-hidden="true">›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">
            Contact Us
          </h3>
          <address className="space-y-3 text-sm text-red-200 not-italic">
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="flex items-start gap-2 hover:text-yellow-300 transition-colors"
              aria-label={`Email us at ${COMPANY_DETAILS.email}`}
            >
              <Mail size={14} className="mt-0.5 shrink-0 text-yellow-400" aria-hidden="true" />
              <span>{COMPANY_DETAILS.email}</span>
            </a>
            <a
              href={`tel:${COMPANY_DETAILS.phoneClean}`}
              className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
              aria-label={`Call us at ${COMPANY_DETAILS.phone}`}
            >
              <Phone size={14} className="shrink-0 text-yellow-400" aria-hidden="true" />
              <span>{COMPANY_DETAILS.phone}</span>
            </a>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-red-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-red-300">
          <p>
            © {year} {COMPANY_DETAILS.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Developed with <Heart size={11} className="text-red-400 fill-red-400 mx-0.5" aria-hidden="true" /> by{" "}
            <a
              href={COMPANY_DETAILS.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 font-semibold ml-1 hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
            >
              {COMPANY_DETAILS.developer.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
