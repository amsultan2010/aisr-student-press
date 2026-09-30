"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", match: (p: string) => p === "/dashboard" },
  {
    href: "/dashboard/articles",
    label: "Articles",
    match: (p: string) => p.startsWith("/dashboard/articles") && p !== "/dashboard/articles/new",
  },
  { href: "/dashboard/articles/new", label: "New article", match: (p: string) => p === "/dashboard/articles/new" },
  { href: "/dashboard/tags", label: "Tags", match: (p: string) => p.startsWith("/dashboard/tags") },
  { href: "/dashboard/team", label: "Team", match: (p: string) => p.startsWith("/dashboard/team") },
  { href: "/dashboard/submissions", label: "Submissions", match: (p: string) => p.startsWith("/dashboard/submissions") },
];

export function NavLinks({ newSubmissions }: { newSubmissions: number }) {
  const pathname = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-4 lg:pb-0">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center justify-between gap-3 px-3 py-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors lg:py-2.5 ${
                active ? "bg-navy text-cream" : "text-cream/70 hover:bg-navy/60 hover:text-cream active:bg-navy"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-300 ease-[var(--ease-press)] motion-reduce:transition-none lg:inset-x-auto lg:inset-y-2 lg:left-0 lg:h-auto lg:w-0.5 ${
                  active ? "scale-100" : "scale-0 group-hover:scale-100"
                }`}
              />
              {link.label}
              {link.href === "/dashboard/submissions" && newSubmissions > 0 ? (
                <span className="grid min-w-5 place-items-center bg-gold px-1 text-[11px] leading-5 tracking-normal text-navy-deep">
                  <span className="sr-only">, </span>
                  {newSubmissions}
                  <span className="sr-only"> new</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
      <li className="shrink-0 lg:hidden">
        <Link
          href="/"
          className="flex items-center px-3 py-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-cream/70 transition-colors hover:bg-navy/60 hover:text-cream active:bg-navy"
        >
          View site
        </Link>
      </li>
    </ul>
  );
}
