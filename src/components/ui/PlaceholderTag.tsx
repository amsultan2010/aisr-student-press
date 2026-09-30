import { cx } from "./cx";

// Quiet marker for seeded placeholder rows (`is_placeholder`).
export function PlaceholderTag({ tone = "ink", className }: { tone?: "ink" | "paper"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-block border border-dashed px-1.5 py-[3px] font-sans text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em]",
        tone === "paper" ? "border-paper/35 text-paper/75" : "border-ink-soft/50 text-ink-soft",
        className,
      )}
    >
      Placeholder
    </span>
  );
}
