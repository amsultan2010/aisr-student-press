"use client";

import { useActionState } from "react";
import { devSignIn, type DevSignInState } from "./actions";
import { btn, field } from "@/components/dashboard/ui";

// Rendered by page.tsx only when NODE_ENV is "development".
export function DevSignIn() {
  const [state, action, pending] = useActionState<DevSignInState, FormData>(devSignIn, { error: null });

  return (
    <details className="group mt-10 border-t border-rule pt-5">
      <summary className="cursor-pointer font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-ink">
        Development only: sign in with a password
      </summary>
      <form action={action} className="mt-4 space-y-4">
        <div>
          <label htmlFor="dev-email" className={field.label}>
            Email
          </label>
          <input id="dev-email" name="email" type="email" autoComplete="username" required className={field.input} />
        </div>
        <div>
          <label htmlFor="dev-password" className={field.label}>
            Password
          </label>
          <input
            id="dev-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={field.input}
          />
        </div>
        {state.error ? (
          <p role="alert" className={field.error}>
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={btn.secondary}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </details>
  );
}
