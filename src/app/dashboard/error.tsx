"use client";

import { useEffect } from "react";
import { btn } from "@/components/dashboard/ui";

export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl border-t-4 border-gold pt-6">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-navy">Something went wrong</p>
      <h1 className="mt-2 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
        This page could not load
      </h1>
      <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft">
        The database may be briefly unreachable, or your session may have expired. Try again, and if it keeps
        happening, sign out and back in.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={btn.primary}>
          Try again
        </button>
        <form action="/auth/signout" method="post">
          <button type="submit" className={btn.secondary}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
