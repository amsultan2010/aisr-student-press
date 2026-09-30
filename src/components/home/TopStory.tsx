import type { ArticleCard as Card } from "@/lib/data";
import { ArticleCard, Byline, CoverImage, Kicker, PlaceholderTag } from "@/components/ui";
import { StretchedLink } from "./StretchedLink";

// Front page: the lead story with a newspaper-sized headline over a wide
// photo, and a numbered "Just in" rail beside it.
export function TopStory({ lead, rail }: { lead: Card; rail: Card[] }) {
  return (
    <section aria-labelledby="top-story" className="mx-auto max-w-page px-4 pt-8 sm:px-6 md:pt-12 lg:px-10">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-0">
        <article data-cursor="Read" className="group relative lg:col-span-8 lg:pr-12">
          <div data-rise className="flex flex-wrap items-center gap-3">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Top story</p>
            <span aria-hidden className="h-px w-8 bg-ink" />
            <Kicker section={lead.section} />
            {lead.is_placeholder && <PlaceholderTag />}
          </div>
          <h2
            id="top-story"
            className="mt-5 font-serif text-[clamp(2.7rem,5.9vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.036em] text-balance"
          >
            <StretchedLink href={lead.href} split="lines">
              {lead.title}
            </StretchedLink>
          </h2>
          <p data-rise className="mt-6 max-w-[56ch] text-[1.2rem] leading-[1.5] text-pretty text-ink-soft md:text-[1.35rem]">
            {lead.dek}
          </p>
          <div data-rise className="mt-6">
            <Byline authors={lead.authors} date={lead.published_at} minutes={lead.reading_minutes} avatar size="md" dateStyle="long" />
          </div>
          <CoverImage
            className="mt-9"
            src={lead.cover_url}
            alt={lead.cover_alt}
            sizes="(min-width: 1024px) 60vw, 100vw"
            ratio="16/9"
            preload
            parallax={7}
          />
        </article>

        <aside aria-labelledby="just-in" className="relative lg:col-span-4 lg:pl-10">
          <span data-rule="y" aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-rule lg:block" />
          <div className="flex items-baseline justify-between">
            <h2 id="just-in" className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
              Just in
            </h2>
            <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-ink-soft">Newest first</p>
          </div>
          <span data-rule aria-hidden className="mt-3 block h-[3px] bg-ink" />
          <ol className="divide-y divide-rule">
            {rail.map((a, i) => (
              <li key={a.id} className="py-6">
                <ArticleCard article={a} variant="text" index={i + 1} />
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
