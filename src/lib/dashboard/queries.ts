import "server-only";
import type { serverClient } from "@/lib/supabase/server";

// Dashboard reads. They run with the editor's session, so RLS returns drafts,
// inactive staff and submissions only to admins.
type Client = Awaited<ReturnType<typeof serverClient>>;

export async function getOverview(supabase: Client) {
  const [days, published, drafts, totals, top, submissions] = await Promise.all([
    supabase.rpc("views_by_day", { p_days: 30 }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("view_count"),
    supabase
      .from("articles")
      .select("id, title, view_count, status, section:sections!inner(short_name)")
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(6),
    supabase
      .from("submissions")
      .select("id, kind, name, title, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const series = (days.data ?? []).map((d) => ({ day: d.day, views: Number(d.views) }));
  const sum = (n: number) => series.slice(-n).reduce((a, d) => a + d.views, 0);
  return {
    series,
    last7: sum(7),
    last30: sum(30),
    totalViews: (totals.data ?? []).reduce((a, r) => a + Number(r.view_count), 0),
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    top: (top.data ?? []) as unknown as {
      id: string;
      title: string;
      view_count: number;
      status: string;
      section: { short_name: string };
    }[],
    submissions: submissions.data ?? [],
  };
}

export type ArticleFilters = { q?: string; section?: string; status?: string; sort?: string };

export async function listArticles(supabase: Client, f: ArticleFilters) {
  let q = supabase
    .from("articles")
    .select(
      "id, slug, title, status, published_at, updated_at, view_count, is_lead, is_editors_pick, in_ticker, is_placeholder, section:sections!inner(slug, short_name)",
    );
  const term = f.q?.trim().replace(/[%_,()"\\]/g, " ").trim();
  if (term) q = q.or(`title.ilike.%${term}%,dek.ilike.%${term}%,slug.ilike.%${term}%`);
  if (f.section) q = q.eq("section.slug", f.section);
  const now = new Date().toISOString();
  if (f.status === "draft") q = q.eq("status", "draft");
  if (f.status === "published") q = q.eq("status", "published").lte("published_at", now);
  if (f.status === "scheduled") q = q.eq("status", "published").gt("published_at", now);

  if (f.sort === "views") q = q.order("view_count", { ascending: false });
  else if (f.sort === "oldest") q = q.order("published_at", { ascending: true, nullsFirst: true });
  else if (f.sort === "title") q = q.order("title");
  else q = q.order("published_at", { ascending: false, nullsFirst: true }).order("updated_at", { ascending: false });

  const { data } = await q.limit(300);
  return (data ?? []) as unknown as {
    id: string;
    slug: string;
    title: string;
    status: string;
    published_at: string | null;
    updated_at: string;
    view_count: number;
    is_lead: boolean;
    is_editors_pick: boolean;
    in_ticker: boolean;
    is_placeholder: boolean;
    section: { slug: string; short_name: string };
  }[];
}

export async function getPlaceholderCounts(supabase: Client) {
  const [articles, staff] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_placeholder", true),
    supabase.from("staff").select("id", { count: "exact", head: true }).eq("is_placeholder", true),
  ]);
  return { articles: articles.count ?? 0, staff: staff.count ?? 0 };
}

// Everything the article editor needs besides the article itself.
export async function getEditorOptions(supabase: Client) {
  const [sections, staff, tags] = await Promise.all([
    supabase.from("sections").select("id, slug, name").order("sort_order"),
    supabase.from("staff").select("id, name, role, is_active").order("sort_order").order("name"),
    supabase.from("tags").select("id, name, slug").order("name"),
  ]);
  return { sections: sections.data ?? [], staff: staff.data ?? [], tags: tags.data ?? [] };
}

export async function getArticleForEdit(supabase: Client, id: string) {
  const { data } = await supabase
    .from("articles")
    .select(
      "*, section:sections!inner(slug), article_authors(staff_id, position), article_tags(tag_id)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as typeof data & {
    section: { slug: string };
    article_authors: { staff_id: string; position: number }[];
    article_tags: { tag_id: string }[];
  };
  return {
    ...row,
    author_ids: [...row.article_authors].sort((a, b) => a.position - b.position).map((a) => a.staff_id),
    tag_ids: row.article_tags.map((t) => t.tag_id),
  };
}

export async function listTags(supabase: Client) {
  const { data } = await supabase.from("tags").select("id, name, slug, article_tags(count)").order("name");
  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    count: (t.article_tags as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function listStaff(supabase: Client) {
  const { data } = await supabase
    .from("staff")
    .select("id, slug, name, role, role_group, photo_url, is_active, is_placeholder, sort_order, article_authors(count)")
    .order("sort_order")
    .order("name");
  return (data ?? []).map((s) => ({
    ...s,
    articles: (s.article_authors as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function getStaffForEdit(supabase: Client, id: string) {
  const { data } = await supabase.from("staff").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function listSubmissions(supabase: Client, status?: string) {
  let q = supabase
    .from("submissions")
    .select("id, kind, name, email, title, message, status, created_at, attachment_path")
    .order("created_at", { ascending: false })
    .limit(300);
  if (status === "new" || status === "read" || status === "archived") q = q.eq("status", status);
  const { data } = await q;
  return data ?? [];
}

export async function countNewSubmissions(supabase: Client) {
  const { count } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new");
  return count ?? 0;
}

export async function getSubmission(supabase: Client, id: string) {
  const { data } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  let attachmentUrl: string | null = null;
  if (data.attachment_path) {
    const { data: signed } = await supabase.storage
      .from("submissions")
      .createSignedUrl(data.attachment_path, 60 * 10, { download: true });
    attachmentUrl = signed?.signedUrl ?? null;
  }
  return { ...data, attachmentUrl };
}
