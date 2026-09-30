import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getRelated } from "@/lib/data";
import { bodyToText } from "@/lib/editor/render";
import { absoluteUrl, isSectionSlug } from "@/lib/site";
import { JsonLd, newsArticleLd, pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { CoverImage } from "@/components/ui/CoverImage";
import { Kicker } from "@/components/ui/Kicker";
import { PlaceholderTag } from "@/components/ui/PlaceholderTag";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleByline } from "@/components/article/ArticleByline";
import { AuthorBox } from "@/components/article/AuthorBox";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ShareBar } from "@/components/article/ShareBar";
import { ViewRecorder } from "@/components/article/ViewRecorder";

export const revalidate = 60;

// Stories render on first visit and are then cached and revalidated.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ section: string; slug: string }> };

const load = cache(async (section: string, slug: string) => (isSectionSlug(section) ? getArticle(section, slug) : null));

function summary(dek: string, body: unknown) {
  if (dek.trim()) return dek.trim();
  const text = bodyToText(body);
  return text.length > 155 ? `${text.slice(0, 152).replace(/\s+\S*$/, "")}...` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const article = await load(section, slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: summary(article.dek, article.body) || `A story from the ${article.section.name} section.`,
    path: article.href,
    type: "article",
    article: {
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.section.name,
      authors: article.authors.map((a) => absoluteUrl(`/author/${a.slug}`)),
      tags: article.tags.map((t) => t.name),
    },
  });
}

export default async function ArticlePage({ params }: Props) {
  const { section, slug } = await params;
  const article = await load(section, slug);
  if (!article) notFound();
  const related = await getRelated(article, 3);
  const url = absoluteUrl(article.href);

  return (
    <>
      <JsonLd data={newsArticleLd(article)} />
      <ReadingProgress targetId="story-body" />
      <ViewRecorder articleId={article.id} />

      <article className="pb-24 md:pb-32">
        <header className="mx-auto max-w-page px-4 pt-10 sm:px-6 md:pt-16 lg:px-10">
          <div className="mx-auto max-w-[64rem]">
            <div className="flex flex-wrap items-center gap-3">
              <Kicker section={article.section} className="text-[12px]" />
              {article.is_placeholder ? <PlaceholderTag /> : null}
            </div>
            <h1
              data-split="lines"
              className="mt-5 font-serif text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.98] font-medium tracking-[-0.032em] text-balance"
            >
              {article.title}
            </h1>
            {article.dek ? (
              <p data-rise className="mt-7 max-w-[58ch] font-serif text-[1.3rem] leading-[1.45] text-ink-soft text-pretty md:text-[1.5rem]">
                {article.dek}
              </p>
            ) : null}
            <div className="mt-10">
              <ArticleByline article={article} />
            </div>
          </div>
        </header>

        {article.cover_url ? (
          <div className="mx-auto mt-10 max-w-page sm:px-6 md:mt-12 lg:px-10">
            <CoverImage
              src={article.cover_url}
              alt={article.cover_alt}
              sizes="(min-width: 1344px) 1264px, (min-width: 640px) calc(100vw - 48px), 100vw"
              ratio="16/9"
              preload
              parallax={6}
              hoverZoom={false}
              caption={article.cover_caption || undefined}
              credit={article.cover_credit || undefined}
              className="[&_figcaption]:px-4 sm:[&_figcaption]:px-0"
            />
          </div>
        ) : null}

        <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 sm:px-6 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)] lg:px-10">
          <aside aria-label="Share this story" className="hidden lg:block">
            <div className="sticky top-36 flex justify-end pr-4 xl:pr-10">
              <ShareBar url={url} title={article.title} layout="rail" />
            </div>
          </aside>

          <div className="min-w-0">
            <ArticleBody id="story-body" body={article.body} />

            {article.tags.length > 0 ? (
              <div className="mt-14 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-rule pt-5">
                <span className="font-sans text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">Filed under</span>
                {article.tags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tag/${t.slug}`}
                    className="font-sans text-[14px] font-semibold text-navy underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink active:text-navy-deep"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-10 border-t border-rule pt-6 lg:hidden">
              <ShareBar url={url} title={article.title} />
            </div>

            <AuthorBox authors={article.authors} />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="more-in-section" className="border-t border-ink bg-paper-2/60">
          <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24 lg:px-10">
            <SectionHeading
              id="more-in-section"
              title={`More in ${article.section.name}`}
              href={`/${article.section.slug}`}
              linkLabel={`All ${article.section.short_name}`}
            />
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} variant="standard" dek />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
