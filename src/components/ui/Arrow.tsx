import { cx } from "./cx";

// Hairline arrow used on "View all" links and buttons. Nudges right on
// hover when a parent has the `group` class.
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 10"
      className={cx("h-[0.6em] w-[1.2em] shrink-0 transition-transform duration-300 ease-press group-hover:translate-x-1", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 5h18M14 1l4 4-4 4" />
    </svg>
  );
}
