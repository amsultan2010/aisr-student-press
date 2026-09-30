import type { ArticleCard as Card } from "@/lib/data";
import { ArticleCard, SectionHeading } from "@/components/ui";

// "Latest stories": one wide feature, two tall cards, then a ruled two-column
// block of compact items. Every item carries date, authors and read time.
export function LatestFeed({ items }: { items: Card[] }) {
  const [first, second, third, ...rest] = items;
  if (!first) return null;
  return (
    <section aria-labelledby="latest-h" className="mx-auto max-w-page px-4 pt-24 sm:px-6 md:pt-32 lg:px-10">
      <SectionHeading id="latest-h" title="Latest stories" eyebrow="The feed" />
      <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
        <ArticleCard
          article={first}
          size="lg"
          dek
          ratio="4/3"
          parallax={5}
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="md:col-span-2 lg:col-span-6"
        />
        {[second, third].filter(Boolean).map((a) => (
          <ArticleCard key={a.id} article={a} dek ratio="4/5" className="lg:col-span-3" sizes="(min-width: 1024px) 22vw, (min-width: 768px) 50vw, 100vw" />
        ))}
      </div>
      {rest.length > 0 && (
        <div className="mt-14">
          <span data-rule aria-hidden className="block h-px bg-ink" />
          <div className="grid gap-8 pt-8 sm:grid-cols-2 [&>*]:min-w-0 lg:gap-x-0 lg:[&>*:nth-child(odd)]:pr-10 lg:[&>*:nth-child(even)]:border-l lg:[&>*:nth-child(even)]:border-rule lg:[&>*:nth-child(even)]:pl-10">
            {rest.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
