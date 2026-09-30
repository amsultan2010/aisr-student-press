import Link from "next/link";
import { SECTIONS, SITE } from "@/lib/site";
import { LinkButton, buttonClass } from "@/components/ui/Button";
import { PageLabel } from "./PageLabel";

// Shared 404 body, used inside the site chrome for both missing stories and
// unmatched URLs.
export function NotFoundView() {
  return (
    <div className="mx-auto max-w-page px-4 pt-14 pb-24 sm:px-6 md:pt-24 md:pb-32 lg:px-10">
      <title>{`Page not found | ${SITE.name}`}</title>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <PageLabel>Error 404</PageLabel>
          <h1
            data-split="lines"
            className="mt-5 font-serif text-[clamp(2.75rem,7vw,6.25rem)] leading-[0.95] font-medium tracking-[-0.035em] text-balance"
          >
            This page did not make the paper.
          </h1>
          <p data-rise className="mt-7 max-w-[52ch] font-serif text-xl leading-relaxed text-ink-soft">
            The link may be broken, or the story may have moved or been taken down. Try the front page, search for it, or
            pick a section below.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <LinkButton href="/" size="lg" arrow magnetic>
              Back to the front page
            </LinkButton>
            <LinkButton href="/submit?kind=contact" variant="outline" size="lg">
              Report a broken link
            </LinkButton>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <form role="search" action="/search" method="get">
            <label htmlFor="nf-q" className="font-sans text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">
              Search the paper
            </label>
            <div className="mt-3 flex border-b-2 border-ink focus-within:border-navy">
              <input
                id="nf-q"
                name="q"
                type="search"
                placeholder="Headline or topic"
                className="min-w-0 flex-1 bg-transparent py-2.5 font-serif text-xl placeholder:text-ink-soft/55 focus:outline-none focus-visible:outline-none"
              />
              <button type="submit" className={buttonClass("primary", "sm", "mb-1.5 self-end")}>
                Search
              </button>
            </div>
          </form>

          <h2 className="mt-12 font-sans text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">Sections</h2>
          <ul className="mt-3 border-t border-ink">
            {SECTIONS.map((s) => (
              <li key={s.slug} className="border-b border-rule">
                <Link
                  href={`/${s.slug}`}
                  className="group flex items-baseline justify-between py-3.5 font-serif text-xl transition-colors hover:text-navy active:text-navy-deep"
                >
                  {s.name}
                  <span aria-hidden className="font-sans text-base text-navy transition-transform duration-300 ease-press group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
