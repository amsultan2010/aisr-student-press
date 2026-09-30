export const SITE = {
  name: "The AISR Student Press",
  shortName: "Student Press",
  tagline: "The student newspaper of the American International School of Riyadh",
  school: "American International School of Riyadh",
  location: "Riyadh, Saudi Arabia",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  instagram: "https://instagram.com/theaisrstudentpress",
  instagramHandle: "@theaisrstudentpress",
  builtBy: { name: "Abdullah Sultan", url: "https://amsultan.site" },
} as const;

// Fixed section list, mirrors public.sections. Order is the nav order.
export const SECTIONS = [
  { slug: "news", name: "School News", short: "News" },
  { slug: "student-life", name: "Student Life & Culture", short: "Student Life" },
  { slug: "sports", name: "Sports", short: "Sports" },
  { slug: "opinion", name: "Opinion", short: "Opinion" },
  { slug: "creative-corner", name: "Creative Corner", short: "Creative Corner" },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];

export const NAV = [
  ...SECTIONS.map((s) => ({ href: `/${s.slug}`, label: s.short })),
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit a Pitch" },
];

export function isSectionSlug(slug: string): slug is SectionSlug {
  return SECTIONS.some((s) => s.slug === slug);
}

export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
