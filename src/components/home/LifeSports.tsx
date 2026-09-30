import type { ArticleCard as Card } from "@/lib/data";
import { ArticleCard, SectionHeading } from "@/components/ui";

// Two sections side by side, split by a column rule: Student Life (photo +
// text list) and Sports (a tight results-style list).
export function LifeSports({ life, sports }: { life: Card[]; sports: Card[] }) {
  if (!life.length && !sports.length) return null;
  const [lifeLead, ...lifeRest] = life;
  return (
    <section className="mx-auto max-w-page px-4 pt-28 sm:px-6 md:pt-40 lg:px-10">
      <div className="grid gap-24 lg:grid-cols-12 lg:gap-0">
        {lifeLead && (
          <div aria-labelledby="life-h" role="region" className="lg:col-span-7 lg:pr-10">
            <SectionHeading id="life-h" title="Student Life" href="/student-life" linkLabel="More" eyebrow="Life and culture" />
            <div className="mt-10 grid gap-10 md:grid-cols-7 md:gap-8">
              <ArticleCard article={lifeLead} dek ratio="4/5" className="md:col-span-4" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 55vw, 100vw" />
              <ul className="divide-y divide-rule md:col-span-3">
                {lifeRest.map((a) => (
                  <li key={a.id} className="py-5 first:pt-0">
                    <ArticleCard article={a} variant="text" dek />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {sports.length > 0 && (
          <div aria-labelledby="sports-h" role="region" className="relative lg:col-span-5 lg:pl-10">
            <span data-rule="y" aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-ink lg:block" />
            <SectionHeading id="sports-h" title="Sports" href="/sports" linkLabel="More" eyebrow="Games and athletes" />
            <ul className="mt-10 divide-y divide-rule">
              {sports.map((a) => (
                <li key={a.id} className="py-5 first:pt-0">
                  <ArticleCard article={a} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
