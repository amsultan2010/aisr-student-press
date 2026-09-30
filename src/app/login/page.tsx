import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import { MotionScope } from "@/components/dashboard/MotionScope";
import { btn } from "@/components/dashboard/ui";
import { GoogleButton } from "./google-button";
import { DevSignIn } from "./dev-sign-in";

export const metadata: Metadata = {
  title: "Editor sign-in",
  robots: { index: false, follow: false },
};

// Supabase and Google error strings are terse; translate the common ones.
function explain(error: string) {
  if (/provider is not enabled|unsupported provider/i.test(error)) {
    return "Google sign-in is not switched on in Supabase yet.";
  }
  if (/access_denied|denied/i.test(error)) return "Google sign-in was cancelled. Try again when you are ready.";
  if (/code verifier|flow state|expired/i.test(error)) {
    return "That sign-in link expired or was opened in a different browser. Start again from this page.";
  }
  return error;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, { user, isAdmin }] = await Promise.all([searchParams, getAdmin()]);
  if (user && isAdmin) redirect("/dashboard");
  const denied = Boolean(user);

  return (
    <MotionScope className="grid min-h-svh bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-navy-deep px-6 py-8 text-cream sm:px-10 lg:px-14 lg:py-14">
        <Link href="/" className="group inline-flex items-center gap-3 self-start">
          <Image
            src="/aisr-seal.png"
            alt=""
            width={48}
            height={48}
            priority
            data-reveal="seal"
            className="size-12 rounded-full"
          />
          <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-soft transition-colors group-hover:text-cream">
            Back to the paper
          </span>
        </Link>

        <div className="mt-12 lg:mt-0">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
            Editors&apos; desk
          </p>
          <p
            data-reveal="split"
            className="mt-3 font-serif text-[2.75rem] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.5rem]"
          >
            The AISR Student&nbsp;Press
          </p>
          <div data-reveal="rule" className="mt-6 h-[3px] w-24 bg-gold" />
          <p data-reveal="up" className="mt-6 max-w-sm font-serif text-lg leading-relaxed text-cream/80">
            Write, schedule and publish stories, manage the team page and read the pitches students send in.
          </p>
        </div>

        <p className="mt-12 hidden font-sans text-[12px] uppercase tracking-[0.12em] text-cream/60 lg:block">
          {SITE.location}
        </p>
      </aside>

      <main className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          {denied ? (
            <>
              <p data-reveal="up" className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-navy">
                Signed in as {user?.email}
              </p>
              <h1
                data-reveal="split"
                className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.02] tracking-[-0.025em] text-ink"
              >
                You do not have access to the dashboard
              </h1>
              <div data-reveal="up" className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-ink-soft">
                <p>
                  This account is not on the editors list, so nothing here is available to it. The dashboard is only
                  for the Co-Editors-in-Chief of {SITE.name}.
                </p>
                <p>If you are one of the editors, sign out and choose the Google account that was added to the list.</p>
              </div>
              <div data-reveal="up" className="mt-8 flex flex-wrap gap-3">
                <form action="/auth/signout" method="post">
                  <button type="submit" className={btn.primary}>
                    Sign out
                  </button>
                </form>
                <Link href="/" className={btn.secondary}>
                  Back to the site
                </Link>
              </div>
            </>
          ) : (
            <>
              <p data-reveal="up" className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-navy">
                For the editors
              </p>
              <h1
                data-reveal="split"
                className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.02] tracking-[-0.025em] text-ink sm:text-[3.25rem]"
              >
                Sign in to the dashboard
              </h1>
              <p data-reveal="up" className="mt-4 font-serif text-lg leading-relaxed text-ink-soft">
                Use the Google account on the editors list. Anyone else who signs in will not see any content.
              </p>
              {error ? (
                <p
                  role="alert"
                  className="mt-6 border-l-4 border-ink bg-gold-soft/60 px-4 py-3 font-sans text-sm leading-relaxed text-ink"
                >
                  <strong className="font-semibold">Sign-in failed.</strong> {explain(error)}
                </p>
              ) : null}
              <div data-reveal="up" className="mt-8">
                <GoogleButton />
              </div>
              {process.env.NODE_ENV === "development" ? <DevSignIn /> : null}
            </>
          )}
        </div>
      </main>
    </MotionScope>
  );
}
