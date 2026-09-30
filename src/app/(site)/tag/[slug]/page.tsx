import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByTag, getTag } from "@/lib/data";
import { SECTIONS } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageLabel } from "@/components/pages/PageLabel";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

const load = cache((slug: string) => getTag(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await load(slug);
  if (!tag) return {};
  return pageMetadata({
    title: `Stories tagged ${tag.name}`,
    description: `Every story about ${tag.name} from The AISR Student Press, the student newspaper of the American International School of Riyadh.`,
    path: `/tag/${tag.slug}`,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await load(slug);
  if (!tag) notFound();
  const stories = await getArticlesByTag(tag.id);
  const [first, ...rest] = stories;

  return (
    <>
      <header className="mx-auto max-w-page px-4 pt-12 sm:px-6 md:pt-20 lg:px-10">
        <PageLabel>Topic</PageLabel>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1
            data-split="chars"
            className="font-serif text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] font-medium tracking-[-0.04em] text-balance"
          >
            {tag.name}
          </h1>
          <p className="pb-3 font-sans text-[12px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </p>
        </div>
        <div aria-hidden className="mt-8">
          <span data-rule className="block h-[3px] bg-ink" />
          <span data-rule className="mt-[3px] block h-px bg-ink" />
        </div>
      </header>

      <section aria-label={`Stories tagged ${tag.name}`} className="mx-auto max-w-page px-4 pt-12 pb-24 sm:px-6 md:pb-32 lg:px-10">
        {first ? (
          <>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <ArticleCard article={first} variant="lead" preload />
              </div>
            </div>
            {rest.length ? (
              <div className="mt-16 grid gap-x-8 gap-y-14 border-t border-rule pt-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="standard" dek />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="max-w-[56ch]">
            <p className="font-serif text-2xl leading-snug tracking-[-0.01em]">No published stories carry this tag yet.</p>
            <p className="mt-3 font-serif text-lg leading-relaxed text-ink-soft">Try one of the sections instead:</p>
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
      </section>
    </>
  );
}
