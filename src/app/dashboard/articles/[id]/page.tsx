import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dashboard/auth";
import { getArticleForEdit, getEditorOptions } from "@/lib/dashboard/queries";
import { ArticleEditor } from "@/components/dashboard/ArticleEditor";
import { BackLink, PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Edit article" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [article, { sections, staff, tags }] = await Promise.all([
    getArticleForEdit(supabase, id),
    getEditorOptions(supabase),
  ]);
  if (!article) notFound();

  return (
    <>
      <BackLink href="/dashboard/articles">All articles</BackLink>
      <PageHeader kicker="Articles" title="Edit article" />
      <ArticleEditor
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          dek: article.dek,
          section_id: article.section_id,
          author_ids: article.author_ids,
          tag_ids: article.tag_ids,
          cover_url: article.cover_url,
          cover_alt: article.cover_alt,
          cover_caption: article.cover_caption,
          cover_credit: article.cover_credit,
          body: article.body,
          status: article.status === "published" ? "published" : "draft",
          published_at: article.published_at,
          is_lead: article.is_lead,
          is_editors_pick: article.is_editors_pick,
          in_ticker: article.in_ticker,
        }}
        saved={{
          status: article.status,
          published_at: article.published_at,
          slug: article.slug,
          section_slug: article.section.slug,
        }}
        sections={sections}
        staff={staff}
        tags={tags}
        isPlaceholder={article.is_placeholder}
      />
    </>
  );
}
