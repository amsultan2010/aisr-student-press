import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dashboard/auth";
import { getStaffForEdit } from "@/lib/dashboard/queries";
import { StaffForm } from "@/components/dashboard/StaffForm";
import { BackLink, PageHeader, btn } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Edit team member" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [person, bylines] = await Promise.all([
    getStaffForEdit(supabase, id),
    supabase.from("article_authors").select("article_id", { count: "exact", head: true }).eq("staff_id", id),
  ]);
  if (!person) notFound();

  return (
    <>
      <BackLink href="/dashboard/team">Team</BackLink>
      <PageHeader kicker={person.role} title={person.name}>
        {person.is_active ? (
          <a href={`/author/${person.slug}`} target="_blank" rel="noopener" className={btn.link}>
            View author page<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </PageHeader>
      <StaffForm
        articleCount={bylines.count ?? 0}
        initial={{
          id: person.id,
          name: person.name,
          slug: person.slug,
          role: person.role,
          role_group: person.role_group,
          bio: person.bio,
          grade: person.grade ?? "",
          instagram: person.instagram ?? "",
          photo_url: person.photo_url,
          is_active: person.is_active,
          sort_order: person.sort_order,
        }}
      />
    </>
  );
}
