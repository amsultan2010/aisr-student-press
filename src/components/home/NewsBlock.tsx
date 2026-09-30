import type { ArticleCard as Card } from "@/lib/data";
import { ArticleCard, SectionHeading } from "@/components/ui";

// School News: lead photo story plus a ruled rail of the next three.
export function NewsBlock({ items, name, count }: { items: Card[]; name: string; count: number }) {
  const [lead, ...rest] = items;
  if (!lead) return null;
  return (
    <section aria-labelledby="news-h" className="mx-auto max-w-page px-4 pt-28 sm:px-6 md:pt-40 lg:px-10">
      <SectionHeading id="news-h" title={name} href="/news" linkLabel="All news" eyebrow="On campus" />
      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-0">
        <ArticleCard
          article={lead}
          size="lg"
          dek
          ratio="16/10"
          parallax={6}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="lg:col-span-7 lg:pr-10"
        />
        <div className="relative lg:col-span-5 lg:pl-10">
          <span data-rule="y" aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-rule lg:block" />
          <ul className="divide-y divide-rule">
            {rest.map((a) => (
              <li key={a.id} className="py-6 first:pt-0">
                <ArticleCard article={a} variant="compact" />
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-ink pt-4 font-sans text-[12px] uppercase tracking-[0.12em] text-ink-soft">
            <span data-count className="font-semibold text-ink">
              {count}
            </span>{" "}
            {count === 1 ? "story" : "stories"} in {name}
          </p>
        </div>
      </div>
    </section>
  );
}
