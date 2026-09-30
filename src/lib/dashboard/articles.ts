"use server";

import { revalidatePath } from "next/cache";
import { bodyToText } from "@/lib/editor/render";
import { adminForAction, NOT_ALLOWED } from "./auth";
import { bodyImageUrls, isAllowedImageUrl, removeMedia } from "./storage";
import { SLUG_PATTERN, type ActionResult, type ArticleInput } from "./types";

function dbError(error: { code?: string; message: string }): ActionResult {
  if (error.code === "23505") return { ok: false, error: "Another article already uses this slug.", fields: { slug: "Taken" } };
  if (error.code === "23503") return { ok: false, error: "A section, author or tag you picked no longer exists. Reload the page." };
  return { ok: false, error: error.message };
}

export async function checkSlugAvailable(slug: string, id: string | null) {
  const admin = await adminForAction();
  if (!admin || !SLUG_PATTERN.test(slug)) return false;
  let q = admin.supabase.from("articles").select("id").eq("slug", slug);
  if (id) q = q.neq("id", id);
  const { data } = await q.limit(1);
  return !data?.length;
}

export async function saveArticle(input: ArticleInput): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase, user } = admin;

  // The input comes from the browser, so every field is re-checked here.
  const title = String(input.title ?? "").trim();
  const slug = String(input.slug ?? "").trim();
  const status = input.status === "published" ? "published" : "draft";
  const publishedAt =
    input.published_at && !Number.isNaN(Date.parse(input.published_at)) ? new Date(input.published_at).toISOString() : null;
  const authorIds = Array.isArray(input.author_ids) ? input.author_ids.map(String) : [];
  const tagIds = Array.isArray(input.tag_ids) ? input.tag_ids.map(String) : [];
  let body: { type?: string; content?: unknown[] } | null = null;
  try {
    body = typeof input.body === "string" ? JSON.parse(input.body) : null;
  } catch {}
  const bodyText = body ? bodyToText(body) : "";
  const coverUrl = typeof input.cover_url === "string" ? input.cover_url.trim() || null : null;
  const fields: Record<string, string> = {};

  if (!title) fields.title = "Add a headline.";
  else if (title.length > 200) fields.title = "Keep the headline under 200 characters.";
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) fields.slug = "Use lowercase letters, numbers and single hyphens.";
  if (String(input.dek ?? "").length > 400) fields.dek = "Keep the summary under 400 characters.";
  if (!Number.isInteger(input.section_id)) fields.section = "Pick a section.";
  if (coverUrl && !isAllowedImageUrl(coverUrl)) fields.cover = "Upload the cover image here instead of linking to it.";
  if (coverUrl && !String(input.cover_alt ?? "").trim()) fields.cover_alt = "Describe the photo for readers who cannot see it.";
  if (!body || body.type !== "doc" || !Array.isArray(body.content)) fields.body = "The article body could not be read.";
  if (status === "published") {
    if (!authorIds.length) fields.authors = "Published articles need at least one byline.";
    if (!bodyText) fields.body = "Published articles need some body text.";
  }
  if (Object.keys(fields).length) {
    return { ok: false, error: "Some fields need attention before this can be saved.", fields };
  }

  const row = {
    title,
    slug,
    dek: String(input.dek ?? "").trim(),
    section_id: input.section_id,
    body: body as never,
    body_text: bodyText,
    cover_url: coverUrl,
    cover_alt: coverUrl ? String(input.cover_alt ?? "").trim() : "",
    cover_caption: String(input.cover_caption ?? "").trim(),
    cover_credit: String(input.cover_credit ?? "").trim(),
    status,
    published_at: publishedAt,
    is_lead: input.is_lead === true,
    is_editors_pick: input.is_editors_pick === true,
    in_ticker: input.in_ticker === true,
  };

  const saved = input.id
    ? await supabase.from("articles").update(row).eq("id", input.id).select("id, published_at").single()
    : await supabase.from("articles").insert({ ...row, created_by: user.id }).select("id, published_at").single();
  if (saved.error) return dbError(saved.error);
  const id = saved.data.id;

  // Bylines and tags are replaced wholesale; the lists are short.
  const authors = [...new Set(authorIds)];
  const tags = [...new Set(tagIds)];
  const clearAuthors = await supabase.from("article_authors").delete().eq("article_id", id);
  if (clearAuthors.error) return dbError(clearAuthors.error);
  if (authors.length) {
    const { error } = await supabase
      .from("article_authors")
      .insert(authors.map((staff_id, position) => ({ article_id: id, staff_id, position })));
    if (error) return dbError(error);
  }
  const clearTags = await supabase.from("article_tags").delete().eq("article_id", id);
  if (clearTags.error) return dbError(clearTags.error);
  if (tags.length) {
    const { error } = await supabase.from("article_tags").insert(tags.map((tag_id) => ({ article_id: id, tag_id })));
    if (error) return dbError(error);
  }

  revalidatePath("/", "layout");
  // The database fills in published_at on first publish; hand it back so the
  // form keeps that date instead of resetting it on the next save.
  return { ok: true, id, published_at: saved.data.published_at };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase } = admin;

  const { data: existing } = await supabase.from("articles").select("cover_url, body").eq("id", id).maybeSingle();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return dbError(error);
  if (existing) await removeMedia(supabase, [existing.cover_url, ...bodyImageUrls(existing.body)]);

  revalidatePath("/", "layout");
  return { ok: true };
}

// Removes the seeded sample articles and sample staff profiles. Anything the
// editors created is never flagged as a placeholder, so it is untouched.
export async function deletePlaceholders(): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase } = admin;

  const articles = await supabase.from("articles").delete().eq("is_placeholder", true);
  if (articles.error) return dbError(articles.error);
  const staff = await supabase.from("staff").delete().eq("is_placeholder", true);
  if (staff.error) return dbError(staff.error);

  revalidatePath("/", "layout");
  return { ok: true };
}
