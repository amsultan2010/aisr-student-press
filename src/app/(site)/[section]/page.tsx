import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleTags, getSection, getSectionArticles } from "@/lib/data";
import { SECTIONS, isSectionSlug } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageLabel } from "@/components/pages/PageLabel";
import { SectionArchive } from "@/components/pages/SectionArchive";

export const revalidate = 60;

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

type Props = { params: Promise<{ section: string }> };

// Enough for a school year of stories; the archive pages through them.
const MAX = 120;
const FRONT = 4;

async function load(slug: string) {
  if (!isSectionSlug(slug)) return null;
  return getSection(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: slug } = await params;
  const section = await load(slug);
  if (!section) return {};
  return pageMetadata({
    title: section.name,
    description: `${section.description} Written by students at the American International School of Riyadh.`,
    path: `/${section.slug}`,
  });
}

export default async function SectionPage({ params }: Props) {
  const { section: slug } = await params;
  const section = await load(slug);
  if (!section) notFound();

  const articles = await getSectionArticles(section.slug, MAX);
  const [lead, ...rest] = articles;
  const rail = rest.slice(0, FRONT - 1);
  const archive = rest.slice(FRONT - 1);
  const tagMap = await getArticleTags(archive.map((a) => a.id));

  const counts = new Map<string, { slug: string; name: string; count: number }>();
  for (const a of archive) {
    for (const t of tagMap[a.id] ?? []) {
      const c = counts.get(t.slug) ?? { ...t, count: 0 };
      c.count += 1;
      counts.set(t.slug, c);
    }
  }
  const tags = [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 12);

  return (
    <>
      <header className="mx-auto max-w-page px-4 pt-12 sm:px-6 md:pt-16 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <PageLabel>Section</PageLabel>
            <h1
              data-split="chars"
              className="mt-4 font-serif text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.04em] text-balance"
            >
              {section.name}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-3">
            <p data-rise className="max-w-[44ch] font-serif text-xl leading-[1.45] text-ink-soft">
              {section.description}
            </p>
            <p className="mt-4 font-sans text-[12px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
              {articles.length} {articles.length === 1 ? "story" : "stories"}
            </p>
          </div>
        </div>
        <div aria-hidden className="mt-10">
          <span data-rule className="block h-[3px] bg-ink" />
          <span data-rule className="mt-[3px] block h-px bg-ink" />
        </div>
      </header>

      {!lead ? (
        <section className="mx-auto max-w-page px-4 py-24 sm:px-6 lg:px-10">
          <h2 className="font-serif text-3xl tracking-[-0.015em]">Nothing here yet.</h2>
          <p className="mt-4 max-w-[52ch] font-serif text-lg leading-relaxed text-ink-soft">
            The first {section.short_name} story is being written. Have an idea for one? Pitch it to the editors.
          </p>
          <LinkButton href="/submit" className="mt-8" arrow>
            Pitch a story
          </LinkButton>
        </section>
      ) : (
        <>
          <section aria-label={`Latest in ${section.name}`} className="mx-auto max-w-page px-4 pt-12 pb-16 sm:px-6 md:pt-14 md:pb-24 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
              <div className={rail.length ? "lg:col-span-8" : "lg:col-span-10"}>
                <ArticleCard article={lead} variant="lead" preload parallax={5} />
              </div>
              {rail.length ? (
                <div className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
                  <h2 className="font-sans text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">Also in {section.short_name}</h2>
                  <ol className="mt-5">
                    {rail.map((a, i) => (
                      <li key={a.id} className="border-t border-rule py-6 first:border-ink">
                        <ArticleCard article={a} variant="text" index={i + 1} dek size="lg" />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </section>

          {archive.length ? (
            <section aria-labelledby="archive-h" className="border-t border-rule bg-paper-2/50">
              <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24 lg:px-10">
                <SectionHeading id="archive-h" title={`More ${section.short_name}`} />
                <div className="mt-8">
                  <SectionArchive
                    label={section.name}
                    tags={tags}
                    items={archive.map((a) => ({
                      id: a.id,
                      tags: (tagMap[a.id] ?? []).map((t) => t.slug),
                      node: <ArticleCard article={a} variant="standard" dek />,
                    }))}
                  />
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      <aside className="mx-auto max-w-page px-4 pb-24 sm:px-6 md:pb-32 lg:px-10">
        <div className="flex flex-col gap-6 border-t-[3px] border-ink pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[48ch] font-serif text-2xl leading-snug tracking-[-0.01em]">
            Know a story {section.slug === "creative-corner" ? "or have work to share" : "that belongs"} in {section.name}?
          </p>
          <LinkButton href="/submit" variant="primary" size="lg" arrow magnetic>
            Send it to the editors
          </LinkButton>
        </div>
      </aside>
    </>
  );
}
