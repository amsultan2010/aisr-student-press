import { cx } from "@/components/ui/cx";
import { SITE } from "@/lib/site";

// Small credit link for the header and the mobile menu. The footer has its own
// full-width version.
export function BuiltByLink({
  tone = "ink",
  className,
  ...rest
}: { tone?: "ink" | "paper" } & React.ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...rest}
      href={SITE.builtBy.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        "group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap py-1 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors",
        tone === "ink" ? "text-ink-soft hover:text-navy active:text-gold" : "text-paper/75 hover:text-paper active:text-gold-soft",
        className,
      )}
    >
      <span aria-hidden className={cx("size-1.5 rounded-full", tone === "ink" ? "bg-gold" : "bg-gold-soft")} />
      Built by
      <span
        className={cx(
          "font-semibold underline decoration-1 underline-offset-[3px] transition-colors",
          tone === "ink" ? "text-ink decoration-gold group-hover:text-navy" : "text-paper decoration-gold-soft",
        )}
      >
        {SITE.builtBy.name}
      </span>
    </a>
  );
}
