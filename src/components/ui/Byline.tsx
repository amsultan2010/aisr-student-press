import Link from "next/link";
import { formatDate, formatShortDate, readTime } from "@/lib/format";
import type { Author } from "@/lib/data";
import { Avatar } from "./Avatar";
import { cx } from "./cx";

type BylineProps = {
  authors: Pick<Author, "slug" | "name" | "photo_url">[];
  /** ISO date. */
  date?: string;
  minutes?: number;
  /** Show the first author's photo or monogram. */
  avatar?: boolean;
  /** "short" = 30 Sep 2026, "long" = 30 September 2026. */
  dateStyle?: "short" | "long";
  size?: "sm" | "md";
  tone?: "ink" | "paper";
  className?: string;
};

function AuthorLinks({ authors, linkClass }: { authors: BylineProps["authors"]; linkClass: string }) {
  return (
    <>
      {authors.map((a, i) => (
        <span key={a.slug}>
          {i > 0 && (i === authors.length - 1 ? " and " : ", ")}
          <Link href={`/author/${a.slug}`} className={linkClass}>
            {a.name}
          </Link>
        </span>
      ))}
    </>
  );
}

// "By Name and Name · 30 Sep 2026 · 2 min read". Names link to author pages.
export function Byline({
  authors,
  date,
  minutes,
  avatar,
  dateStyle = "short",
  size = "sm",
  tone = "ink",
  className,
}: BylineProps) {
  const paper = tone === "paper";
  const linkClass = cx(
    "relative z-10 font-semibold underline decoration-1 underline-offset-[3px] transition-colors duration-200",
    paper
      ? "text-paper decoration-paper/30 hover:decoration-gold-soft active:text-gold-soft"
      : "text-ink decoration-rule hover:decoration-navy hover:text-navy active:text-navy-deep",
  );
  const dateText = date ? (dateStyle === "long" ? formatDate(date) : formatShortDate(date)) : "";
  const parts = [
    authors.length > 0 && (
      <span key="by">
        By <AuthorLinks authors={authors} linkClass={linkClass} />
      </span>
    ),
    dateText && (
      <time key="date" dateTime={date} className="whitespace-nowrap">
        {dateText}
      </time>
    ),
    minutes ? (
      <span key="read" className="whitespace-nowrap">
        {readTime(minutes)}
      </span>
    ) : null,
  ].filter(Boolean);

  return (
    <div
      className={cx(
        "flex items-center gap-3 font-sans leading-snug",
        size === "md" ? "text-sm" : "text-[12.5px]",
        paper ? "text-paper/75" : "text-ink-soft",
        className,
      )}
    >
      {avatar && authors[0] && <Avatar name={authors[0].name} photoUrl={authors[0].photo_url} size={size === "md" ? 44 : 32} tone={tone} />}
      <p className="min-w-0">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && (
              <span aria-hidden className="mx-1.5">
                ·
              </span>
            )}
            {part}
          </span>
        ))}
      </p>
    </div>
  );
}
