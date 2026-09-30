import { createElement } from "react";
import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";
import type { Article, StaffMember } from "./data";

// Metadata and structured data helpers shared by every public page.

type PageMeta = {
  title: string;
  description: string;
  path: string;
  // Use the title as-is, without the "| The AISR Student Press" template.
  absoluteTitle?: boolean;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  article?: { publishedTime: string; modifiedTime: string; section: string; authors: string[]; tags: string[] };
};

// The generated site card (src/app/opengraph-image.tsx). A page that sets its
// own openGraph replaces the inherited image, so it is added back here. Story
// pages keep their own generated card, which takes priority as a file.
const SITE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name };

export function pageMetadata({ title, description, path, absoluteTitle, type = "website", noindex, article }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;
  const images = type === "article" ? {} : { images: [SITE_IMAGE] };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE.name,
      locale: "en_US",
      ...images,
      ...(type === "article" && article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            section: article.section,
            authors: article.authors,
            tags: article.tags,
          }
        : { type }),
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, ...images },
  };
}

// Absolute URL for a stored image (local /placeholders path or Storage URL).
export function absoluteImage(src: string | null | undefined) {
  if (!src) return undefined;
  return /^https?:\/\//.test(src) ? src : absoluteUrl(src);
}

// Staff Instagram may be stored as a handle or a full URL.
export function instagramUrl(value: string | null | undefined) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//.test(v)) return v;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}

const ORG_ID = absoluteUrl("/#organization");

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.tagline,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/aisr-seal.png"), width: 316, height: 316 },
    sameAs: [SITE.instagram],
    parentOrganization: { "@type": "EducationalOrganization", name: SITE.school },
    address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
    publishingPrinciples: absoluteUrl("/about#ethics"),
    ethicsPolicy: absoluteUrl("/about#ethics"),
    correctionsPolicy: absoluteUrl("/about#corrections"),
    masthead: absoluteUrl("/about#team"),
  };
}

export function newsArticleLd(article: Article) {
  const url = absoluteUrl(article.href);
  const image = absoluteImage(article.cover_url);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: article.title,
    description: article.dek || undefined,
    image: image ? [image] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    articleSection: article.section.name,
    keywords: article.tags.map((t) => t.name).join(", ") || undefined,
    author: article.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      jobTitle: a.role,
      url: absoluteUrl(`/author/${a.slug}`),
    })),
    publisher: { "@type": "NewsMediaOrganization", "@id": ORG_ID, name: SITE.name, logo: absoluteUrl("/aisr-seal.png") },
    isAccessibleForFree: true,
    inLanguage: "en",
  };
}

export function profilePageLd(person: StaffMember) {
  const url = absoluteUrl(`/author/${person.slug}`);
  const ig = instagramUrl(person.instagram);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      "@id": `${url}#person`,
      name: person.name,
      jobTitle: person.role,
      description: person.bio || undefined,
      image: absoluteImage(person.photo_url),
      url,
      sameAs: ig ? [ig] : undefined,
      affiliation: { "@type": "NewsMediaOrganization", "@id": ORG_ID, name: SITE.name },
    },
  };
}

// Renders a JSON-LD <script>. `<` is escaped so stored text cannot close the tag.
export function JsonLd({ data }: { data: object }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}

// Site-wide NewsMediaOrganization. Drop into the homepage and about page.
export function OrganizationJsonLd() {
  return JsonLd({ data: organizationLd() });
}
