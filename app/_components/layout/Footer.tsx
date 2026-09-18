import Link from "next/link";
import { Mail, Phone, MapPin, Sparkles, Heart } from "lucide-react";
import { BRAND } from "../../_lib/constants";

/**
 * Site-wide footer shown on all pages via root layout.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-red-900 via-red-800 to-red-900 text-white mt-16">
      {/* Decorative top border */}
      <div className="h-1 bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-400" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="size-9 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500
              flex items-center justify-center shadow-md"
            >
              <Sparkles size={18} className="text-red-800" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">
                MKK <span className="text-yellow-400">Fireworks</span>
              </p>
              <p className="text-xs text-red-300 mt-0.5">{BRAND.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-red-200 leading-relaxed max-w-xs">
            Premium quality fireworks, sparklers, and celebration accessories. Trusted since 2005 in
            Sivakasi, Tamil Nadu.
          </p>
        </div>

        {/* Quick links */}
        <div>
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
                  <span className="text-yellow-500">›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm text-red-200">
            <li>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-start gap-2 hover:text-yellow-300 transition-colors"
              >
                <Mail size={14} className="mt-0.5 shrink-0 text-yellow-400" />
                <span>{BRAND.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
              >
                <Phone size={14} className="shrink-0 text-yellow-400" />
                <span>{BRAND.phone}</span>
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-yellow-400" />
              <span>{BRAND.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-red-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-red-300">
          <p>© {year} MKK Fireworks. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Developed with <Heart size={11} className="text-red-400 fill-red-400 mx-0.5" /> by{" "}
            <a
              href="https://mkkcreation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 font-semibold ml-1 hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
            >
              MKK Creation
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
