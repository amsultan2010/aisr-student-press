import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dashboard/auth";
import { StaffForm } from "@/components/dashboard/StaffForm";
import { BackLink, PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Add team member" };

export default async function NewStaffPage() {
  await requireAdmin();
  return (
    <>
      <BackLink href="/dashboard/team">Team</BackLink>
      <PageHeader kicker="Team" title="Add team member" />
      <StaffForm
        initial={{
          id: null,
          name: "",
          slug: "",
          role: "Staff Writer",
          role_group: "writers",
          bio: "",
          grade: "",
          instagram: "",
          photo_url: null,
          is_active: true,
          sort_order: 100,
        }}
      />
    </>
  );
}
