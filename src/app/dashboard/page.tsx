import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dashboard/auth";
import { getOverview, getPlaceholderCounts } from "@/lib/dashboard/queries";
import { formatDateline, formatShortDate } from "@/lib/format";
import { MotionScope } from "@/components/dashboard/MotionScope";
import { ViewsChart } from "@/components/dashboard/ViewsChart";
import { EmptyState, Notice, PageHeader, SectionTitle, btn } from "@/components/dashboard/ui";

// Same segment as the dashboard layout, so the root title template applies here.
export const metadata: Metadata = { title: "Dashboard" };

const num = new Intl.NumberFormat("en-GB");

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();
  const [o, placeholders] = await Promise.all([getOverview(supabase), getPlaceholderCounts(supabase)]);

  const stats = [
    { label: "Total views", value: o.totalViews },
    { label: "Last 7 days", value: o.last7 },
    { label: "Last 30 days", value: o.last30 },
    { label: "Published", value: o.published },
    { label: "Drafts", value: o.drafts },
  ];

  return (
    <MotionScope>
      <PageHeader kicker={formatDateline()} title="Overview">
        <Link href="/dashboard/articles/new" className={btn.primary}>
          New article
        </Link>
      </PageHeader>

      {placeholders.articles > 0 ? (
        <div className="mb-8">
          <Notice>
            The site still shows {placeholders.articles} placeholder{" "}
            {placeholders.articles === 1 ? "article" : "articles"}. When your first real stories are in, remove them
            from{" "}
            <Link href="/dashboard/articles" className={btn.link}>
              Articles
            </Link>{" "}
            with &ldquo;Delete all placeholder content&rdquo;.
          </Notice>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-px border-y border-ink bg-rule lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper px-4 py-5 last:col-span-2 lg:px-5 lg:last:col-span-1">
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{s.label}</dt>
            <dd
              data-reveal="count"
              data-value={s.value}
              className="mt-1 font-serif text-[2.5rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-ink"
            >
              {num.format(s.value)}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-12" aria-labelledby="views-title">
        <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-rule pb-2">
          <h2 id="views-title" className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
            Daily views, last 30 days
          </h2>
          <p className="font-sans text-[12px] text-ink-soft">Riyadh time, one view per reader per 30 minutes</p>
        </div>
        <ViewsChart series={o.series} />
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="top-title">
          <SectionTitle
            action={
              <Link href="/dashboard/articles?sort=views" className={btn.link}>
                All by views
              </Link>
            }
          >
            <span id="top-title">Most read</span>
          </SectionTitle>
          {o.top.length ? (
            <ol className="divide-y divide-rule">
              {o.top.map((a, i) => (
                <li key={a.id} className="flex items-baseline gap-4 py-3">
                  <span className="w-5 shrink-0 font-serif text-xl text-navy" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/articles/${a.id}`}
                      className="font-serif text-lg leading-snug text-ink decoration-rule underline-offset-4 hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="font-sans text-[12px] uppercase tracking-[0.08em] text-ink-soft">{a.section.short_name}</p>
                  </div>
                  <span className="shrink-0 font-sans text-sm tabular-nums text-ink">
                    {num.format(a.view_count)} <span className="text-ink-soft">views</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No reads yet">Once readers open articles, the most read ones are listed here.</EmptyState>
          )}
        </section>

        <section aria-labelledby="subs-title">
          <SectionTitle
            action={
              <Link href="/dashboard/submissions" className={btn.link}>
                Inbox
              </Link>
            }
          >
            <span id="subs-title">Latest submissions</span>
          </SectionTitle>
          {o.submissions.length ? (
            <ul className="divide-y divide-rule">
              {o.submissions.map((s) => (
                <li key={s.id} className="py-3">
                  <Link href={`/dashboard/submissions/${s.id}`} className="group block">
                    <p className="flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.08em] text-ink-soft">
                      {s.status === "new" ? <span className="bg-gold px-1.5 font-semibold text-navy-deep">New</span> : null}
                      {s.kind} from {s.name}
                      <span aria-hidden="true">/</span>
                      {formatShortDate(s.created_at)}
                    </p>
                    <p className="mt-0.5 line-clamp-1 font-serif text-lg text-ink decoration-rule underline-offset-4 group-hover:underline">
                      {s.title || s.message}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="The inbox is empty">
              Pitches and messages sent from the Submit a Pitch page arrive here.
            </EmptyState>
          )}
        </section>
      </div>
    </MotionScope>
  );
}
