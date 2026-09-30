"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/client";

const NOT_SET_UP =
  "Google sign-in is not switched on yet. In Supabase, open Authentication, then Sign In / Providers, and enable Google with the club's OAuth client ID and secret.";

export function GoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);

    // When a provider is off, Supabase answers the redirect with a bare JSON
    // error page. Check first so the editor gets a readable message instead.
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      });
      const settings = (await res.json()) as { external?: { google?: boolean } };
      if (!settings.external?.google) {
        setError(NOT_SET_UP);
        setPending(false);
        return;
      }
    } catch {
      // Could not reach the settings endpoint; let the sign-in call report it.
    }

    const { error } = await browserClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
    // On success the browser is already on its way to Google.
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="group flex w-full items-center justify-center gap-3 border border-ink bg-cream px-5 py-3.5 font-sans text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-ink hover:text-paper active:translate-y-px disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-cream disabled:hover:text-ink"
      >
        <span className="grid size-7 place-items-center rounded-full bg-cream">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </span>
        {pending ? "Opening Google..." : "Continue with Google"}
      </button>
      {error ? (
        <p role="alert" className="mt-4 border-l-4 border-ink bg-gold-soft/60 px-4 py-3 font-sans text-sm leading-relaxed text-ink">
          <strong className="font-semibold">Sign-in did not start.</strong> {error}
        </p>
      ) : null}
    </div>
  );
}
