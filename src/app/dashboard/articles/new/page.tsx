import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dashboard/auth";
import { getEditorOptions } from "@/lib/dashboard/queries";
import { ArticleEditor } from "@/components/dashboard/ArticleEditor";
import { BackLink, PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  const { supabase } = await requireAdmin();
  const { sections, staff, tags } = await getEditorOptions(supabase);

  return (
    <>
      <BackLink href="/dashboard/articles">All articles</BackLink>
      <PageHeader kicker="Articles" title="New article" />
      <ArticleEditor
        initial={{
          id: null,
          title: "",
          slug: "",
          dek: "",
          section_id: sections[0]?.id ?? 1,
          author_ids: [],
          tag_ids: [],
          cover_url: null,
          cover_alt: "",
          cover_caption: "",
          cover_credit: "",
          body: { type: "doc", content: [] },
          status: "draft",
          published_at: null,
          is_lead: false,
          is_editors_pick: false,
          in_ticker: false,
        }}
        saved={null}
        sections={sections}
        staff={staff}
        tags={tags}
      />
    </>
  );
}
