import Link from "next/link";
import { cx } from "@/components/ui/cx";

// Headline link that covers its nearest positioned ancestor (the card).
export function StretchedLink({ href, children, split, className }: { href: string; children: React.ReactNode; split?: "lines" | "chars"; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "block underline decoration-transparent decoration-[0.06em] underline-offset-[0.14em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:content-[''] group-hover:decoration-current group-active:opacity-80",
        className,
      )}
    >
      <span data-split={split} className="block">
        {children}
      </span>
    </Link>
  );
}
