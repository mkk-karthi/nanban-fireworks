import type { MetadataRoute } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const dynamic = "force-static";

/**
 * Dynamic sitemap for MKK Fireworks.
 * Next.js 16 automatically serves this at /sitemap.xml.
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
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "never",
      priority: 0.3,
    },
  ];
}
