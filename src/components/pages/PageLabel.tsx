import { cx } from "@/components/ui/cx";

// Small uppercase page label with a gold lead-in rule, used above page titles.
export function PageLabel({ children, tone = "navy", className }: { children: React.ReactNode; tone?: "navy" | "gold"; className?: string }) {
  return (
    <p
      className={cx(
        "flex items-center gap-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase",
        tone === "gold" ? "text-gold-soft" : "text-navy",
        className,
      )}
    >
      <span aria-hidden className="h-[2px] w-8 bg-gold" />
      {children}
    </p>
  );
}
