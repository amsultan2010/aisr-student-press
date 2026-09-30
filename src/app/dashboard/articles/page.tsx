import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dashboard/auth";
import { deleteArticle, deletePlaceholders } from "@/lib/dashboard/articles";
import { getPlaceholderCounts, listArticles } from "@/lib/dashboard/queries";
import { formatShortDate } from "@/lib/format";
import { ArticleFilters } from "@/components/dashboard/ArticleFilters";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { EmptyState, PageHeader, StatusBadge, articleStatus, btn } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Articles" };

type Search = { q?: string; section?: string; status?: string; sort?: string };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const { supabase } = await requireAdmin();
  const [articles, placeholders] = await Promise.all([listArticles(supabase, filters), getPlaceholderCounts(supabase)]);
  const filtered = Boolean(filters.q || filters.section || filters.status);
  const num = new Intl.NumberFormat("en-GB");

  return (
    <>
      <PageHeader kicker="Newsroom" title="Articles">
        {placeholders.articles + placeholders.staff > 0 ? (
          <ConfirmButton
            label="Delete all placeholder content"
            title="Delete all placeholder content?"
            confirmLabel="Delete placeholders"
            variant="secondary"
            action={deletePlaceholders}
          >
            <p>
              This permanently deletes the {placeholders.articles} sample{" "}
              {placeholders.articles === 1 ? "article" : "articles"} and {placeholders.staff} sample staff{" "}
              {placeholders.staff === 1 ? "profile" : "profiles"} that came with the site, including any edits made to
              them. Their bylines and tag links go with them.
            </p>
            <p>
              Articles and team members you created are not touched. The two Co-Editors-in-Chief profiles stay. This
              cannot be undone.
            </p>
          </ConfirmButton>
        ) : null}
        <Link href="/dashboard/articles/new" className={btn.primary}>
          New article
        </Link>
      </PageHeader>

      <ArticleFilters q={filters.q ?? ""} section={filters.section ?? ""} status={filters.status ?? ""} sort={filters.sort ?? ""} />

      <p className="mb-3 font-sans text-[13px] text-ink-soft" aria-live="polite">
        {articles.length} {articles.length === 1 ? "article" : "articles"}
        {filtered ? (articles.length === 1 ? " matches these filters" : " match these filters") : ""}
      </p>

      {articles.length ? (
        <ul className="border-t border-ink">
          {articles.map((a) => {
            const status = articleStatus(a.status, a.published_at);
            const flags = [a.is_lead && "Top story", a.is_editors_pick && "Article of the Month", a.in_ticker && "Ticker"].filter(
              Boolean,
            );
            return (
              <li
                key={a.id}
                className="grid gap-x-6 gap-y-2 border-b border-rule py-4 md:grid-cols-[minmax(0,1fr)_6rem_7rem_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                    {a.section.short_name}
                    {a.is_placeholder ? <span className="ml-2 border border-gold px-1 text-ink">Placeholder</span> : null}
                  </p>
                  <Link
                    href={`/dashboard/articles/${a.id}`}
                    className="mt-0.5 block font-serif text-[1.3rem] font-medium leading-snug tracking-[-0.01em] text-ink decoration-rule underline-offset-4 hover:underline"
                  >
                    {a.title || "Untitled"}
                  </Link>
                  {flags.length ? (
                    <p className="mt-1 font-sans text-[12px] text-navy">
                      <span className="sr-only">Flags: </span>
                      {flags.join(" / ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 md:block">
                  <StatusBadge status={status} />
                  <p className="font-sans text-[12px] text-ink-soft md:mt-1">
                    {a.published_at ? formatShortDate(a.published_at) : `Edited ${formatShortDate(a.updated_at)}`}
                  </p>
                </div>
                <p className="font-sans text-sm tabular-nums text-ink md:text-right">
                  {num.format(a.view_count)} <span className="text-ink-soft">{a.view_count === 1 ? "view" : "views"}</span>
                </p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link href={`/dashboard/articles/${a.id}`} className={btn.quiet}>
                    Edit
                  </Link>
                  {status === "published" ? (
                    <a href={`/${a.section.slug}/${a.slug}`} target="_blank" rel="noopener" className={btn.quiet}>
                      View<span className="sr-only"> {a.title} on the site (opens in a new tab)</span>
                    </a>
                  ) : null}
                  <ConfirmButton label="Delete" title="Delete this article?" action={deleteArticle.bind(null, a.id)}>
                    <p>
                      &ldquo;{a.title || "Untitled"}&rdquo; will be removed from the site, along with its uploaded
                      images. This cannot be undone.
                    </p>
                  </ConfirmButton>
                </div>
              </li>
            );
          })}
        </ul>
      ) : filtered ? (
        <EmptyState title="Nothing matches these filters">
          <Link href="/dashboard/articles" className={btn.link}>
            Clear the filters
          </Link>{" "}
          to see every article.
        </EmptyState>
      ) : (
        <EmptyState title="No articles yet">
          Write the first one with{" "}
          <Link href="/dashboard/articles/new" className={btn.link}>
            New article
          </Link>
          .
        </EmptyState>
      )}
    </>
  );
}
