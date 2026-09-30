import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dashboard/auth";
import { listTags } from "@/lib/dashboard/queries";
import { TagsManager } from "@/components/dashboard/TagsManager";
import { PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Tags" };

export default async function TagsPage() {
  const { supabase } = await requireAdmin();
  const tags = await listTags(supabase);

  return (
    <>
      <PageHeader kicker="Newsroom" title="Tags" />
      <TagsManager tags={tags} />
    </>
  );
}
