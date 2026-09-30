import Link from "next/link";
import type { Metadata } from "next";
import { searchArticles } from "@/lib/data";
import { SECTIONS } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { buttonClass } from "@/components/ui/Button";
import { PageLabel } from "@/components/pages/PageLabel";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

function query(q: string | string[] | undefined) {
  return (Array.isArray(q) ? q[0] : q ?? "").trim().slice(0, 200);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = query((await searchParams).q);
  return pageMetadata({
    title: q ? `Search results for "${q}"` : "Search the paper",
    description: "Search every story published by The AISR Student Press by headline, summary or text.",
    path: "/search",
    noindex: Boolean(q),
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const q = query((await searchParams).q);
  const results = q ? await searchArticles(q, 40) : [];

  return (
    <>
      <header className="mx-auto max-w-page px-4 pt-12 sm:px-6 md:pt-20 lg:px-10">
        <PageLabel>Search</PageLabel>
        <h1
          data-split="lines"
          className="mt-4 font-serif text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.035em]"
        >
          {q ? "Search results" : "Search the paper"}
        </h1>

        <form role="search" action="/search" method="get" className="mt-10 max-w-4xl">
          <label htmlFor="search-q" className="font-sans text-xs font-semibold tracking-[0.12em] text-ink uppercase">
            Search every story
          </label>
          <div className="mt-3 flex border-b-[3px] border-ink focus-within:border-navy">
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Try a club, a team, a teacher or an event"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={200}
              className="min-w-0 flex-1 bg-transparent py-3 font-serif text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.015em] placeholder:text-ink-soft/55 focus:outline-none focus-visible:outline-none"
            />
            <button type="submit" className={buttonClass("primary", "md", "mb-2 self-end")}>
              Search
            </button>
          </div>
        </form>
      </header>

      <section aria-labelledby="results-h" className="mx-auto max-w-page px-4 pt-12 pb-24 sm:px-6 md:pb-32 lg:px-10">
        {!q ? (
          <>
            <h2 id="results-h" className="font-sans text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">
              Or browse a section
            </h2>
            <ul className="mt-4 border-t border-ink">
              {SECTIONS.map((s) => (
                <li key={s.slug} className="border-b border-rule">
                  <Link
                    href={`/${s.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-5 font-serif text-2xl tracking-[-0.015em] transition-colors hover:text-navy active:text-navy-deep md:text-3xl"
                  >
                    {s.name}
                    <span aria-hidden className="font-sans text-lg text-navy transition-transform duration-300 ease-press group-hover:translate-x-1.5">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 id="results-h" aria-live="polite" className="font-sans text-[13px] text-ink-soft">
              <span className="font-semibold text-ink tabular-nums">{results.length}</span>{" "}
              {results.length === 1 ? "story matches" : "stories match"}{" "}
              <span className="font-semibold text-ink">&ldquo;{q}&rdquo;</span>
            </h2>
            {results.length ? (
              <ol className="mt-6 grid border-t border-ink md:grid-cols-2 md:gap-x-12">
                {results.map((a) => (
                  <li key={a.id} className="border-b border-rule py-6">
                    <ArticleCard article={a} variant="compact" level={3} />
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-8 max-w-[60ch] border-t border-ink pt-8">
                <p className="font-serif text-2xl leading-snug tracking-[-0.01em]">Nothing matched that search.</p>
                <p className="mt-3 font-serif text-lg leading-relaxed text-ink-soft">
                  Check the spelling, try fewer or more general words, or browse a section:
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {SECTIONS.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/${s.slug}`} className="font-sans text-sm font-semibold text-navy underline decoration-rule underline-offset-4 hover:text-ink hover:decoration-ink active:text-navy-deep">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
