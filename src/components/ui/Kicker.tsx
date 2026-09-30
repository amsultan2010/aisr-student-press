import Link from "next/link";
import { cx } from "./cx";

type KickerProps = {
  /** Section to label. `short_name` is preferred when present. */
  section: { slug: string; name: string; short_name?: string };
  /** Render as plain text instead of a link to the section front. */
  plain?: boolean;
  tone?: "navy" | "gold" | "paper";
  className?: string;
};

const TONES = {
  navy: "text-navy hover:text-ink",
  gold: "text-gold-soft hover:text-paper",
  paper: "text-paper/80 hover:text-paper",
};

// Uppercase Franklin section label. Sits above z-10 so it stays clickable
// inside cards that use a stretched headline link.
export function Kicker({ section, plain, tone = "navy", className }: KickerProps) {
  const label = section.short_name ?? section.name;
  const base = cx(
    "relative z-10 inline-block font-sans text-[11px] font-semibold uppercase leading-none tracking-[0.14em]",
    TONES[tone],
    className,
  );
  if (plain) return <span className={base}>{label}</span>;
  return (
    <Link
      href={`/${section.slug}`}
      className={cx(
        base,
        "underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 hover:decoration-current active:opacity-70",
      )}
    >
      {label}
    </Link>
  );
}
