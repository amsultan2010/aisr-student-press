import Link from "next/link";
import { Arrow } from "./Arrow";
import { cx } from "./cx";

type SectionHeadingProps = {
  title: string;
  /** Adds a "View all" link on the right. */
  href?: string;
  linkLabel?: string;
  /** Small Franklin label above the title. */
  eyebrow?: string;
  as?: "h2" | "h3";
  tone?: "ink" | "paper";
  id?: string;
  className?: string;
};

// Newspaper section band: serif title, a double rule that fills the row
// (drawn in by MotionScope via [data-rule]), and an optional "View all" link.
export function SectionHeading({ title, href, linkLabel = "View all", eyebrow, as: Tag = "h2", tone = "ink", id, className }: SectionHeadingProps) {
  const paper = tone === "paper";
  return (
    <div className={cx("flex flex-wrap items-end gap-x-4 gap-y-3 sm:flex-nowrap sm:gap-x-6", className)}>
      <div className="min-w-0 sm:shrink-0">
        {eyebrow && (
          <p className={cx("mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em]", paper ? "text-gold-soft" : "text-navy")}>
            {eyebrow}
          </p>
        )}
        <Tag
          id={id}
          data-split="chars"
          className={cx(
            "font-serif text-[clamp(2rem,3.6vw,3.25rem)] font-medium leading-[0.95] tracking-[-0.03em]",
            paper ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </Tag>
      </div>
      <div aria-hidden className="mb-[0.55rem] min-w-8 flex-1 basis-8">
        <span data-rule className={cx("block h-[3px]", paper ? "bg-paper" : "bg-ink")} />
        <span data-rule className={cx("mt-[3px] block h-px", paper ? "bg-paper/60" : "bg-ink")} />
      </div>
      {href && (
        <Link
          href={href}
          className={cx(
            "group mb-[0.2rem] inline-flex shrink-0 items-center gap-2 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
            paper ? "text-paper hover:text-gold-soft active:text-gold" : "text-navy hover:text-ink active:text-navy-deep",
          )}
        >
          {linkLabel}
          <Arrow />
        </Link>
      )}
    </div>
  );
}
