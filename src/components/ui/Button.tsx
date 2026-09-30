import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Arrow } from "./Arrow";
import { cx } from "./cx";

type Variant = "primary" | "outline" | "gold" | "paper";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy text-paper hover:bg-navy-deep active:bg-ink",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper active:bg-navy-deep",
  gold: "bg-gold text-ink hover:bg-gold-soft active:bg-gold",
  paper: "border border-paper/50 text-paper hover:border-paper hover:bg-paper hover:text-navy-deep active:bg-gold-soft",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2.5 text-[11.5px]",
  md: "px-5 py-3.5 text-[12.5px]",
  lg: "px-7 py-4.5 text-[13px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cx(
    "group inline-flex items-center justify-center gap-2.5 font-sans font-semibold uppercase leading-none tracking-[0.12em]",
    "transition-colors duration-200 active:translate-y-px",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type Common = {
  variant?: Variant;
  size?: Size;
  /** Pulls toward the pointer on desktop (handled globally by the site chrome). */
  magnetic?: boolean;
  /** Trailing arrow that nudges on hover. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  magnetic,
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} data-magnetic={magnetic ? "" : undefined} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

type LinkButtonProps = Common & {
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  "aria-label"?: string;
};

export function LinkButton({ href, external, variant, size, magnetic, arrow, className, children, ...rest }: LinkButtonProps) {
  const props = {
    className: buttonClass(variant, size, className),
    "data-magnetic": magnetic ? "" : undefined,
    ...rest,
  };
  const inner = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {inner}
    </Link>
  );
}
