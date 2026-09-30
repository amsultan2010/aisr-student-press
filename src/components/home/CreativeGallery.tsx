import type { ArticleCard as Card } from "@/lib/data";
import { Byline, CoverImage, Kicker, PlaceholderTag, SectionHeading } from "@/components/ui";
import { StretchedLink } from "./StretchedLink";

function Piece({ article, ratio, n, sizes }: { article: Card; ratio: string; n: number; sizes: string }) {
  return (
    <article data-card data-cursor="View" data-tilt className="group relative">
      <CoverImage src={article.cover_url} alt={article.cover_alt} sizes={sizes} ratio={ratio} parallax={5} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Kicker section={article.section} />
            {article.is_placeholder && <PlaceholderTag />}
          </div>
          <h3 className="mt-2 font-serif text-[1.55rem] italic leading-[1.1] tracking-[-0.015em]">
            <StretchedLink href={article.href}>{article.title}</StretchedLink>
          </h3>
          <Byline className="mt-2.5" authors={article.authors} date={article.published_at} minutes={article.reading_minutes} />
        </div>
        <span aria-hidden className="shrink-0 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          No. {String(n).padStart(2, "0")}
        </span>
      </div>
    </article>
  );
}

// Image-led gallery. The three columns drift at different rates on scroll.
export function CreativeGallery({ items }: { items: Card[] }) {
  const [a, b, c, d] = items;
  if (!a) return null;
  return (
    <section aria-labelledby="creative-h" className="mx-auto max-w-page overflow-x-clip px-4 pt-28 sm:px-6 md:pt-44 lg:px-10">
      <SectionHeading id="creative-h" title="Creative Corner" href="/creative-corner" linkLabel="See all work" eyebrow="Poems, stories, art and photography" />
      <div className="mt-12 grid gap-14 md:grid-cols-12 md:gap-8">
        <div data-drift="16" className="md:col-span-5">
          <Piece article={a} ratio="4/5" n={1} sizes="(min-width: 768px) 40vw, 100vw" />
        </div>
        {b && (
          <div data-drift="56" className="md:col-span-4 md:pt-32">
            <Piece article={b} ratio="3/4" n={2} sizes="(min-width: 768px) 32vw, 100vw" />
          </div>
        )}
        {c && (
          <div data-drift="96" className="space-y-14 md:col-span-3 md:pt-12">
            <Piece article={c} ratio="1/1" n={3} sizes="(min-width: 768px) 24vw, 100vw" />
            {d && <Piece article={d} ratio="4/3" n={4} sizes="(min-width: 768px) 24vw, 100vw" />}
          </div>
        )}
      </div>
    </section>
  );
}
