import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/dashboard/auth";
import { deleteStaff } from "@/lib/dashboard/staff";
import { listStaff } from "@/lib/dashboard/queries";
import { ROLE_GROUPS } from "@/lib/dashboard/types";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { EmptyState, PageHeader, btn } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase } = await requireAdmin();
  const staff = await listStaff(supabase);

  return (
    <>
      <PageHeader kicker="Masthead" title="Team">
        <Link href="/dashboard/team/new" className={btn.primary}>
          Add team member
        </Link>
      </PageHeader>

      {staff.length ? (
        <div className="space-y-10">
          {ROLE_GROUPS.map((group) => {
            const people = staff.filter((s) => s.role_group === group.value);
            if (!people.length) return null;
            return (
              <section key={group.value} aria-labelledby={`g-${group.value}`}>
                <h2
                  id={`g-${group.value}`}
                  className="mb-1 border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink"
                >
                  {group.label}
                </h2>
                <ul>
                  {people.map((p) => (
                    <li
                      key={p.id}
                      className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-rule py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_8rem_auto]"
                    >
                      <div className="relative size-14 overflow-hidden rounded-full bg-paper-2">
                        {p.photo_url ? (
                          <Image src={p.photo_url} alt="" fill sizes="56px" className="object-cover" />
                        ) : (
                          <span aria-hidden="true" className="grid size-full place-items-center font-serif text-xl text-ink-soft">
                            {p.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/team/${p.id}`}
                          className="font-serif text-lg text-ink decoration-rule underline-offset-4 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <p className="font-sans text-[13px] text-ink-soft">
                          {p.role}
                          {p.is_active ? "" : " / Inactive"}
                          {p.is_placeholder ? " / Placeholder" : ""}
                          {p.photo_url ? "" : " / No photo yet"}
                        </p>
                      </div>
                      <p className="col-start-2 font-sans text-[13px] tabular-nums text-ink-soft sm:col-start-auto">
                        {p.articles} {p.articles === 1 ? "article" : "articles"}
                      </p>
                      <div className="col-start-2 flex flex-wrap gap-2 sm:col-start-auto sm:justify-end">
                        <Link href={`/dashboard/team/${p.id}`} className={btn.quiet}>
                          Edit
                        </Link>
                        <ConfirmButton label="Delete" title={`Delete ${p.name}?`} action={deleteStaff.bind(null, p.id)}>
                          <p>
                            Their profile and author page are removed
                            {p.articles
                              ? `, and their name comes off the byline of ${p.articles} ${p.articles === 1 ? "article" : "articles"}`
                              : ""}
                            . To hide them without deleting anything, edit them and untick Active instead.
                          </p>
                        </ConfirmButton>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No team members yet">Add the editors and writers so their names can go on bylines.</EmptyState>
      )}
    </>
  );
}
