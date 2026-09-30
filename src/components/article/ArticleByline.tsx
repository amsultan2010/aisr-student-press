import Link from "next/link";
import type { Article } from "@/lib/data";
import { formatDate, readTime } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";

// Byline strip under the headline: every author with photo or monogram, their
// role, the publish date (and last update if it came later) and read time.
export function ArticleByline({ article }: { article: Article }) {
  const published = new Date(article.published_at).getTime();
  const updated = new Date(article.updated_at).getTime();
  const showUpdated = updated - published > 1000 * 60 * 60 && formatDate(article.updated_at) !== formatDate(article.published_at);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-y border-ink py-5">
      {article.authors.length > 0 ? (
        <ul className="flex flex-wrap gap-x-8 gap-y-4">
          {article.authors.map((a) => (
            <li key={a.slug}>
              <Link href={`/author/${a.slug}`} className="group flex items-center gap-3.5">
                <Avatar name={a.name} photoUrl={a.photo_url} size={48} className="transition-transform duration-300 ease-press group-hover:scale-105" />
                <span className="leading-tight">
                  <span className="block font-sans text-[15px] font-semibold underline decoration-rule decoration-1 underline-offset-4 transition-colors group-hover:text-navy group-hover:decoration-navy group-active:text-navy-deep">
                    {a.name}
                  </span>
                  <span className="mt-1 block font-sans text-[12px] tracking-[0.04em] text-ink-soft">{a.role}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-sans text-sm text-ink-soft">By the staff of the Press</p>
      )}
      <p className="font-sans text-[13px] leading-relaxed text-ink-soft">
        <time dateTime={article.published_at} className="font-semibold text-ink">
          {formatDate(article.published_at)}
        </time>
        {showUpdated ? (
          <>
            <span aria-hidden className="mx-2">
              ·
            </span>
            Updated <time dateTime={article.updated_at}>{formatDate(article.updated_at)}</time>
          </>
        ) : null}
        <span aria-hidden className="mx-2">
          ·
        </span>
        {readTime(article.reading_minutes)}
      </p>
    </div>
  );
}
