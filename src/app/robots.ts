import type { MetadataRoute } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const dynamic = "force-static";

/**
 * Dynamic robots.txt for MKK Fireworks.
 * Next.js 16 automatically serves this at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow cart page indexing — it has no static content
        disallow: "/cart",
      },
    ],
    sitemap: `${COMPANY_DETAILS.siteUrl}/sitemap.xml`,
    host: COMPANY_DETAILS.siteUrl,
  };
}
