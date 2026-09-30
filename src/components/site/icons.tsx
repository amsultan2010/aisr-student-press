import { cx } from "@/components/ui/cx";

// Bespoke 1.5px line icons, sized by font-size (1em).
type IconProps = { className?: string };

export function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={cx("size-[1em]", className)}>
      <circle cx="8.5" cy="8.5" r="6" />
      <path d="M13 13l5 5" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={cx("size-[1em]", className)}>
      <rect x="2.5" y="2.5" width="15" height="15" rx="4.2" />
      <circle cx="10" cy="10" r="3.6" />
      <circle cx="14.6" cy="5.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="1.6" className={cx("h-[0.7em] w-[1.1em]", className)}>
      <path d="M0 1h22M0 7h22M8 13h14" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={cx("size-[1em]", className)}>
      <path d="M3 3l14 14M17 3L3 17" />
    </svg>
  );
}
