import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dashboard/auth";
import { listSubmissions } from "@/lib/dashboard/queries";
import { formatShortDate } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Submissions" };

const TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const { supabase } = await requireAdmin();
  const rows = await listSubmissions(supabase, status);

  return (
    <>
      <PageHeader kicker="Inbox" title="Submissions" />

      <nav aria-label="Filter submissions" className="mb-6 flex flex-wrap gap-1 border-b border-rule">
        {TABS.map((t) => {
          const active = t.value === status;
          return (
            <Link
              key={t.label}
              href={t.value ? `/dashboard/submissions?status=${t.value}` : "/dashboard/submissions"}
              aria-current={active ? "page" : undefined}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                active ? "border-navy text-ink" : "border-transparent text-ink-soft hover:border-rule hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {rows.length ? (
        <ul className="border-t border-ink">
          {rows.map((s) => (
            <li key={s.id} className="border-b border-rule">
              <Link
                href={`/dashboard/submissions/${s.id}`}
                className="group grid gap-x-6 gap-y-1 py-4 transition-colors hover:bg-paper-2/60 sm:grid-cols-[9rem_minmax(0,1fr)_7rem] sm:px-2"
              >
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                  {s.status === "new" ? <span className="mr-2 bg-gold px-1.5 text-navy-deep">New</span> : null}
                  {s.kind}
                </p>
                <div className="min-w-0">
                  <p
                    className={`truncate font-serif text-lg text-ink decoration-rule underline-offset-4 group-hover:underline ${s.status === "new" ? "font-semibold" : ""}`}
                  >
                    {s.title || s.message}
                  </p>
                  <p className="truncate font-sans text-[13px] text-ink-soft">
                    {s.name}, {s.email}
                    {s.attachment_path ? " / Has an attachment" : ""}
                    {s.status === "archived" ? " / Archived" : ""}
                  </p>
                </div>
                <p className="font-sans text-[13px] text-ink-soft sm:text-right">{formatShortDate(s.created_at)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={status ? `No ${status} submissions` : "The inbox is empty"}>
          Pitches, letters, photos and messages sent from the Submit a Pitch page arrive here.
        </EmptyState>
      )}
    </>
  );
}
