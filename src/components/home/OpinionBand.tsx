import type { ArticleCard as Card } from "@/lib/data";
import { Avatar, Byline, Kicker, PlaceholderTag, SectionHeading } from "@/components/ui";
import { StretchedLink } from "./StretchedLink";

// Outline of Newsreader's opening quote mark, drawn on and then filled.
const QUOTE =
  "M46.92 6.55Q34.12 12.34 28.83 18.8Q23.54 25.26 23.54 33.14Q23.54 38.06 26.49 41.45Q29.45 44.83 33.32 46.98Q37.2 49.14 40.15 50.43Q43.11 51.72 43.11 52.71Q43.11 61.08 37.57 66.62Q32.03 72.15 23.29 72.15Q13.94 72.15 7.97 66.12Q2 60.09 2 48.65Q2 39.42 6.37 31.05Q10.74 22.68 20.15 15.35Q29.57 8.03 44.46 2ZM98 6.55Q85.2 12.34 79.91 18.8Q74.62 25.26 74.62 33.14Q74.62 38.06 77.57 41.45Q80.52 44.83 84.4 46.98Q88.28 49.14 91.23 50.43Q94.18 51.72 94.18 52.71Q94.18 61.08 88.65 66.62Q83.11 72.15 74.37 72.15Q65.02 72.15 59.05 66.12Q53.08 60.09 53.08 48.65Q53.08 39.42 57.45 31.05Q61.82 22.68 71.23 15.35Q80.65 8.03 95.54 2Z";

// Opinion is led by writers, not photos: columnist monograms, italic
// headlines, a drawn quote mark and vertical column rules.
export function OpinionBand({ items: all }: { items: Card[] }) {
  const items = all.slice(0, 4);
  if (!items.length) return null;
  return (
    <section aria-labelledby="opinion-h" className="mt-28 bg-paper-2 py-20 md:mt-40 md:py-28">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <svg
            data-draw="fill"
            aria-hidden
            viewBox="0 0 100 76"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            className="w-20 text-navy lg:col-span-1 lg:w-full lg:max-w-24"
          >
            <path d={QUOTE} />
          </svg>
          <div className="lg:col-span-11">
            <SectionHeading id="opinion-h" title="Opinion" href="/opinion" linkLabel="All opinion" eyebrow="Columns, letters and debate" />
          </div>
        </div>
        <p data-rise className="mt-6 max-w-[52ch] font-serif text-[1.2rem] italic leading-snug text-ink-soft lg:ml-[calc(100%/12)] lg:pl-8">
          Arguments from students, signed by the people who wrote them. Views here are the writers&apos; own.
        </p>

        <div className={`mt-14 grid gap-12 md:grid-cols-2 lg:gap-0 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {items.map((a, i) => (
            <article
              key={a.id}
              data-card
              data-cursor="Read"
              className="group relative lg:px-8 lg:first:pl-0 lg:last:pr-0"
            >
              {i > 0 && <span data-rule="y" aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-ink/20 lg:block" />}
              <div className="flex items-center gap-3">
                <Avatar name={a.authors[0]?.name ?? "Staff"} photoUrl={a.authors[0]?.photo_url} size={52} />
                <div className="flex flex-col items-start gap-1.5">
                  <Kicker section={a.section} />
                  {a.is_placeholder && <PlaceholderTag />}
                </div>
              </div>
              <h3 className="mt-6 font-serif text-[1.7rem] font-medium italic leading-[1.08] tracking-[-0.02em] text-balance">
                <StretchedLink href={a.href}>{a.title}</StretchedLink>
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.5] text-ink-soft">{a.dek}</p>
              <Byline className="mt-5" authors={a.authors} date={a.published_at} minutes={a.reading_minutes} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
