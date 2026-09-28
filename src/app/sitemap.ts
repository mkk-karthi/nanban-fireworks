import type { MetadataRoute } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const dynamic = "force-static";

/**
 * Dynamic sitemap for Nanban Crackers.
 * Next.js 16 automatically serves this at /sitemap.xml.
 * Cart page excluded — it has robots noindex set.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = COMPANY_DETAILS.siteUrl;
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
