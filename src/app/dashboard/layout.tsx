import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/dashboard/auth";
import { countNewSubmissions } from "@/lib/dashboard/queries";
import { NavLinks } from "@/components/dashboard/NavLinks";

export const metadata: Metadata = {
  title: { template: "%s | Dashboard | The AISR Student Press", default: "Dashboard | The AISR Student Press" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const newSubmissions = await countNewSubmissions(supabase);

  return (
    <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a
        href="#dash-main"
        className="sr-only z-50 bg-gold px-4 py-2 font-sans text-sm font-semibold text-navy-deep focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <aside className="bg-navy-deep text-cream lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-7 lg:pb-8 lg:pt-8">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <Image src="/aisr-seal.png" alt="" width={40} height={40} className="size-10 rounded-full" />
            <span>
              <span className="block font-serif text-[1.15rem] font-medium leading-tight tracking-[-0.01em]">
                Student Press
              </span>
              <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-soft transition-colors group-hover:text-cream">
                Editors&apos; desk
              </span>
            </span>
          </Link>
          <form action="/auth/signout" method="post" className="lg:hidden">
            <button
              type="submit"
              className="border border-cream/30 px-3 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-cream/80 transition-colors hover:border-cream hover:text-cream active:translate-y-px"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav aria-label="Dashboard" className="lg:flex-1">
          <NavLinks newSubmissions={newSubmissions} />
        </nav>

        <div className="hidden border-t border-cream/15 px-7 py-6 lg:block">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-cream/80 transition-colors hover:text-gold-soft"
          >
            View site
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 2h6v6M10 2 3 9" />
            </svg>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <p className="mt-5 truncate font-sans text-[12px] text-cream/60" title={user.email}>
            {user.email}
          </p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button
              type="submit"
              className="font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-cream/80 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream active:text-gold-soft"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main id="dash-main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
        <p className="mx-auto mt-16 max-w-6xl border-t border-rule pt-4 font-sans text-[12px] text-ink-soft lg:hidden">
          Signed in as {user.email}
        </p>
      </main>
    </div>
  );
}
