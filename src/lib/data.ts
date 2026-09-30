import "server-only";
import { publicClient } from "./supabase/public";
import type { Json } from "./supabase/database.types";

// Public read layer. Every function runs as `anon`, so RLS limits results to
// published articles. Pages using these should export `revalidate`.

export type Author = { slug: string; name: string; role: string; photo_url: string | null };

export type ArticleCard = {
  id: string;
  slug: string;
  href: string;
  title: string;
  dek: string;
  cover_url: string | null;
  cover_alt: string;
  published_at: string;
  reading_minutes: number;
  view_count: number;
  is_placeholder: boolean;
  section: { slug: string; name: string; short_name: string };
  authors: Author[];
};

export type Article = ArticleCard & {
  body: Json;
  cover_caption: string;
  cover_credit: string;
  updated_at: string;
  tags: { slug: string; name: string }[];
  authors: (Author & { bio: string })[];
};

export type StaffMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  role_group: string;
  bio: string;
  photo_url: string | null;
  grade: string | null;
  instagram: string | null;
  is_placeholder: boolean;
};

const CARD_FIELDS = `
  id, slug, title, dek, cover_url, cover_alt, published_at, reading_minutes, view_count, is_placeholder,
  section:sections!inner(slug, name, short_name),
  article_authors(position, staff(slug, name, role, photo_url))
`;

type CardRow = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  cover_url: string | null;
  cover_alt: string;
  published_at: string | null;
  reading_minutes: number;
  view_count: number;
  is_placeholder: boolean;
  section: { slug: string; name: string; short_name: string };
  article_authors: { position: number; staff: Author | null }[];
};

export function articleHref(sectionSlug: string, slug: string) {
  return `/${sectionSlug}/${slug}`;
}

function toCard(row: CardRow): ArticleCard {
  return {
    id: row.id,
    slug: row.slug,
    href: articleHref(row.section.slug, row.slug),
    title: row.title,
    dek: row.dek,
    cover_url: row.cover_url,
    cover_alt: row.cover_alt,
    published_at: row.published_at ?? "",
    reading_minutes: row.reading_minutes,
    view_count: row.view_count,
    is_placeholder: row.is_placeholder,
    section: row.section,
    authors: [...row.article_authors]
      .sort((a, b) => a.position - b.position)
      .flatMap((aa) => (aa.staff ? [aa.staff] : [])),
  };
}

function cards(rows: unknown) {
  return ((rows as CardRow[] | null) ?? []).map(toCard);
}

function newest() {
  return publicClient().from("articles").select(CARD_FIELDS).order("published_at", { ascending: false });
}

export async function getLatest(limit = 12, excludeIds: string[] = []) {
  let q = newest().limit(limit);
  if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
  const { data } = await q;
  return cards(data);
}

// Top breaking story: the newest article flagged as lead, else the newest article.
export async function getLead() {
  const { data } = await newest().eq("is_lead", true).limit(1);
  const lead = cards(data)[0];
  if (lead) return lead;
  return (await getLatest(1))[0] ?? null;
}

// "Article of the Month": the newest editor's pick.
export async function getEditorsPick() {
  const { data } = await newest().eq("is_editors_pick", true).limit(1);
  return cards(data)[0] ?? null;
}

// Ticker items: flagged stories, else the latest headlines.
export async function getTicker(limit = 10) {
  const { data } = await newest().eq("in_ticker", true).limit(limit);
  const flagged = cards(data);
  return flagged.length ? flagged : getLatest(8);
}

export async function getSections() {
  const { data } = await publicClient()
    .from("sections")
    .select("id, slug, name, short_name, description, sort_order")
    .order("sort_order");
  return data ?? [];
}

export async function getSection(slug: string) {
  const { data } = await publicClient()
    .from("sections")
    .select("id, slug, name, short_name, description")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getSectionArticles(sectionSlug: string, limit = 24, offset = 0) {
  const { data } = await newest()
    .eq("section.slug", sectionSlug)
    .range(offset, offset + limit - 1);
  return cards(data);
}

export async function getArticle(sectionSlug: string, slug: string): Promise<Article | null> {
  const { data } = await publicClient()
    .from("articles")
    .select(
      `id, slug, title, dek, body, cover_url, cover_alt, cover_caption, cover_credit, published_at, updated_at,
       reading_minutes, view_count, is_placeholder,
       section:sections!inner(slug, name, short_name),
       article_authors(position, staff(slug, name, role, photo_url, bio)),
       article_tags(tags(slug, name))`,
    )
    .eq("slug", slug)
    .eq("section.slug", sectionSlug)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as CardRow & {
    body: Json;
    cover_caption: string;
    cover_credit: string;
    updated_at: string;
    article_authors: { position: number; staff: (Author & { bio: string }) | null }[];
    article_tags: { tags: { slug: string; name: string } | null }[];
  };
  return {
    ...toCard(row),
    authors: [...row.article_authors]
      .sort((a, b) => a.position - b.position)
      .flatMap((aa) => (aa.staff ? [aa.staff] : [])),
    body: row.body,
    cover_caption: row.cover_caption,
    cover_credit: row.cover_credit,
    updated_at: row.updated_at,
    tags: row.article_tags.flatMap((t) => (t.tags ? [t.tags] : [])),
  };
}

// More from the same section, newest first.
export async function getRelated(article: Pick<ArticleCard, "id" | "section">, limit = 3) {
  const { data } = await newest()
    .eq("section.slug", article.section.slug)
    .neq("id", article.id)
    .limit(limit);
  return cards(data);
}

export async function getStaff(): Promise<StaffMember[]> {
  const { data } = await publicClient()
    .from("staff")
    .select("id, slug, name, role, role_group, bio, photo_url, grade, instagram, is_placeholder")
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getStaffMember(slug: string): Promise<StaffMember | null> {
  const { data } = await publicClient()
    .from("staff")
    .select("id, slug, name, role, role_group, bio, photo_url, grade, instagram, is_placeholder")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getArticlesByStaff(staffId: string, limit = 48) {
  const supabase = publicClient();
  const { data: links } = await supabase.from("article_authors").select("article_id").eq("staff_id", staffId);
  const ids = (links ?? []).map((l) => l.article_id);
  if (!ids.length) return [];
  const { data } = await newest().in("id", ids).limit(limit);
  return cards(data);
}

export async function getTag(slug: string) {
  const { data } = await publicClient().from("tags").select("id, slug, name").eq("slug", slug).maybeSingle();
  return data;
}

export async function getArticlesByTag(tagId: string, limit = 48) {
  const supabase = publicClient();
  const { data: links } = await supabase.from("article_tags").select("article_id").eq("tag_id", tagId);
  const ids = (links ?? []).map((l) => l.article_id);
  if (!ids.length) return [];
  const { data } = await newest().in("id", ids).limit(limit);
  return cards(data);
}

export async function searchArticles(query: string, limit = 30) {
  const q = query.trim();
  if (!q) return [];
  const { data } = await publicClient()
    .from("articles")
    .select(CARD_FIELDS)
    .textSearch("search", q, { type: "websearch", config: "english" })
    .order("published_at", { ascending: false })
    .limit(limit);
  return cards(data);
}

// Everything the sitemap needs in one round trip each.
export async function getSitemapEntries() {
  const supabase = publicClient();
  const [articles, staff, tags] = await Promise.all([
    supabase.from("articles").select("slug, updated_at, section:sections!inner(slug)"),
    supabase.from("staff").select("slug, updated_at"),
    supabase.from("tags").select("slug"),
  ]);
  return {
    articles: ((articles.data as unknown as { slug: string; updated_at: string; section: { slug: string } }[]) ?? []).map(
      (a) => ({ path: articleHref(a.section.slug, a.slug), updated_at: a.updated_at }),
    ),
    staff: staff.data ?? [],
    tags: tags.data ?? [],
  };
}

// Real published-article counts, in total and per section (homepage count-ups).
export async function getArticleCounts() {
  const { data } = await publicClient().from("articles").select("section:sections!inner(slug)");
  const rows = (data as unknown as { section: { slug: string } }[] | null) ?? [];
  const bySection: Record<string, number> = {};
  for (const row of rows) bySection[row.section.slug] = (bySection[row.section.slug] ?? 0) + 1;
  return { total: rows.length, bySection };
}

// Tags for a set of articles, keyed by article id (section front filters).
export async function getArticleTags(articleIds: string[]) {
  const out: Record<string, { slug: string; name: string }[]> = {};
  if (!articleIds.length) return out;
  const { data } = await publicClient()
    .from("article_tags")
    .select("article_id, tags(slug, name)")
    .in("article_id", articleIds);
  for (const row of (data as unknown as { article_id: string; tags: { slug: string; name: string } | null }[] | null) ?? []) {
    if (row.tags) (out[row.article_id] ??= []).push(row.tags);
  }
  return out;
}
