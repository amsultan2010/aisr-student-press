import Link from "next/link";
import type { ArticleCard as ArticleCardData } from "@/lib/data";
import { Byline } from "./Byline";
import { CoverImage } from "./CoverImage";
import { Kicker } from "./Kicker";
import { PlaceholderTag } from "./PlaceholderTag";
import { cx } from "./cx";

type Variant = "lead" | "standard" | "compact" | "text";

type ArticleCardProps = {
  article: ArticleCardData;
  variant?: Variant;
  /** Heading level for the headline. Defaults: lead h2, others h3. */
  level?: 2 | 3 | 4;
  /** next/image sizes. Sensible defaults per variant. */
  sizes?: string;
  /** Preload the cover (the first big image on a page). */
  preload?: boolean;
  /** Show the dek (standard and text variants; lead always shows it). */
  dek?: boolean;
  /** Larger headline for standard cards that span wide columns. */
  size?: "md" | "lg";
  /** Cover aspect ratio override. */
  ratio?: string;
  /** Numbered list rails (text variant): shows a big numeral. */
  index?: number;
  /** Scrubbed parallax on the cover (lead and large standard cards). */
  parallax?: number;
  /** "paper" for cards placed on navy bands. */
  tone?: "ink" | "paper";
  className?: string;
};

const DEFAULT_SIZES = {
  lead: "(min-width: 1024px) 62vw, 100vw",
  standard: "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw",
  compact: "120px",
};

// Headline link that stretches over the whole card, so the card is one big
// click target while kicker and author links (z-10) stay independently usable.
function Headline({
  article,
  level,
  className,
  split,
}: {
  article: ArticleCardData;
  level: 2 | 3 | 4;
  className: string;
  split?: boolean;
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={className}>
      <Link
        href={article.href}
        className="block underline decoration-transparent decoration-[0.06em] underline-offset-[0.14em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:content-[''] group-hover:decoration-current group-active:opacity-80"
      >
        <span data-split={split ? "lines" : undefined} className="block">
          {article.title}
        </span>
      </Link>
    </Tag>
  );
}

function Meta({ article, tone, className }: { article: ArticleCardData; tone: "ink" | "paper"; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2.5", className)}>
      <Kicker section={article.section} tone={tone === "paper" ? "gold" : "navy"} />
      {article.is_placeholder && <PlaceholderTag tone={tone} />}
    </div>
  );
}

// One card component, four shapes. Every variant shows the section kicker,
// headline, author links, date and read time.
export function ArticleCard({
  article,
  variant = "standard",
  level,
  sizes,
  preload,
  dek,
  size = "md",
  ratio,
  index,
  parallax,
  tone = "ink",
  className,
}: ArticleCardProps) {
  const paper = tone === "paper";
  const h = level ?? (variant === "lead" ? 2 : 3);
  const byline = (cls?: string, extra?: { avatar?: boolean; size?: "sm" | "md" }) => (
    <Byline
      authors={article.authors}
      date={article.published_at}
      minutes={article.reading_minutes}
      tone={tone}
      className={cls}
      {...extra}
    />
  );
  const dekClass = cx("text-pretty", paper ? "text-paper/80" : "text-ink-soft");
  const cardBase = cx("group relative", paper ? "text-paper" : "text-ink", className);

  if (variant === "lead") {
    return (
      <article data-card data-cursor="Read" className={cardBase}>
        <CoverImage
          src={article.cover_url}
          alt={article.cover_alt}
          sizes={sizes ?? DEFAULT_SIZES.lead}
          ratio={ratio ?? "16/10"}
          preload={preload}
          parallax={parallax}
          tone={tone}
        />
        <Meta article={article} tone={tone} className="mt-6" />
        <Headline
          article={article}
          level={h}
          split
          className="mt-4 font-serif text-[clamp(2.5rem,5.4vw,5rem)] font-medium leading-[0.98] tracking-[-0.032em] text-balance"
        />
        <p className={cx("mt-5 max-w-[62ch] text-[1.1875rem] leading-[1.5] md:text-[1.3rem]", dekClass)}>{article.dek}</p>
        {byline("mt-6", { avatar: true, size: "md" })}
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article data-card data-cursor="Read" className={cx(cardBase, "grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]")}>
        <CoverImage src={article.cover_url} alt={article.cover_alt} sizes={sizes ?? DEFAULT_SIZES.compact} ratio={ratio ?? "1/1"} reveal={false} tone={tone} />
        <div className="min-w-0">
          <Meta article={article} tone={tone} />
          <Headline article={article} level={h} className="mt-2 font-serif text-[1.125rem] font-medium leading-[1.18] tracking-[-0.01em] text-balance" />
          {byline("mt-2")}
        </div>
      </article>
    );
  }

  if (variant === "text") {
    return (
      <article data-card data-cursor="Read" className={cx(cardBase, index != null && "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3")}>
        {index != null && (
          <span aria-hidden className={cx("font-serif text-[2.4rem] italic leading-[0.85] tracking-[-0.04em]", paper ? "text-gold-soft" : "text-navy")}>
            {index}
          </span>
        )}
        <div className="min-w-0">
          <Meta article={article} tone={tone} />
          <Headline
            article={article}
            level={h}
            className={cx(
              "mt-2 font-serif font-medium tracking-[-0.012em] text-balance",
              size === "lg" ? "text-[1.6rem] leading-[1.1]" : "text-[1.2rem] leading-[1.18]",
            )}
          />
          {dek && <p className={cx("mt-2 text-[0.98rem] leading-[1.45]", dekClass)}>{article.dek}</p>}
          {byline("mt-2.5")}
        </div>
      </article>
    );
  }

  return (
    <article data-card data-cursor="Read" className={cx(cardBase, "flex flex-col")}>
      <CoverImage
        src={article.cover_url}
        alt={article.cover_alt}
        sizes={sizes ?? DEFAULT_SIZES.standard}
        ratio={ratio ?? "3/2"}
        preload={preload}
        parallax={parallax}
        tone={tone}
      />
      <Meta article={article} tone={tone} className="mt-4" />
      <Headline
        article={article}
        level={h}
        className={cx(
          "mt-2.5 font-serif font-medium text-balance",
          size === "lg"
            ? "text-[clamp(1.75rem,2.6vw,2.4rem)] leading-[1.04] tracking-[-0.025em]"
            : "text-[1.4rem] leading-[1.14] tracking-[-0.015em]",
        )}
      />
      {dek && <p className={cx("mt-2.5 text-[1.02rem] leading-[1.45]", dekClass)}>{article.dek}</p>}
      {byline("mt-3")}
    </article>
  );
}
