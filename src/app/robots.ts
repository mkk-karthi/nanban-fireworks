import type { MetadataRoute } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const dynamic = "force-static";

/**
 * Dynamic robots.txt for Nanban Crackers.
 * Next.js 16 automatically serves this at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/cart/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/cart", "/cart/"],
      },
    ],
    sitemap: `${COMPANY_DETAILS.canonicalUrl}sitemap.xml`,
  };
}
