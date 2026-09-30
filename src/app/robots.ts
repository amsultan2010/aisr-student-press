import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Everything public is open to every crawler, AI crawlers included.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
