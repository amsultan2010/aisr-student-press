import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { SECTIONS, absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, staff, tags } = await getSitemapEntries();
  // Fronts change when a story in them changes.
  const latest = (prefix = "/") =>
    articles
      .filter((a) => a.path.startsWith(prefix))
      .reduce<Date | undefined>((max, a) => {
        const d = new Date(a.updated_at);
        return !max || d > max ? d : max;
      }, undefined);
  return [
    { url: absoluteUrl("/"), lastModified: latest(), changeFrequency: "daily", priority: 1 },
    ...SECTIONS.map((s) => ({
      url: absoluteUrl(`/${s.slug}`),
      lastModified: latest(`/${s.slug}/`),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/submit"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/search"), changeFrequency: "yearly", priority: 0.2 },
    ...articles.map((a) => ({
      url: absoluteUrl(a.path),
      lastModified: new Date(a.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...staff.map((p) => ({
      url: absoluteUrl(`/author/${p.slug}`),
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...tags.map((t) => ({ url: absoluteUrl(`/tag/${t.slug}`), changeFrequency: "weekly" as const, priority: 0.3 })),
  ];
}
