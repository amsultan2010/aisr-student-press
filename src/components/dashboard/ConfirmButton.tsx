"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/dashboard/types";
import { btn } from "./ui";

// A button that asks before running a destructive server action. Uses the
// native <dialog>, which traps focus and closes on Escape.
export function ConfirmButton({
  action,
  label,
  title,
  children,
  confirmLabel = "Delete",
  redirectTo,
  variant = "quiet",
}: {
  action: () => Promise<ActionResult>;
  label: string;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  redirectTo?: string;
  variant?: keyof typeof btn;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const titleId = useId();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      dialog.current?.close();
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <>
      <button type="button" className={btn[variant]} onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => setError(null)}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-ink bg-paper p-0 text-ink backdrop:bg-navy-deep/60"
      >
        <div className="border-t-4 border-gold px-6 py-6 sm:px-8">
          <h2 id={titleId} className="font-serif text-2xl font-medium leading-tight tracking-[-0.015em]">
            {title}
          </h2>
          <div className="mt-3 space-y-2 font-sans text-[15px] leading-relaxed text-ink-soft">{children}</div>
          {error ? (
            <p role="alert" className="mt-4 border-l-4 border-ink bg-gold-soft/60 px-3 py-2 font-sans text-sm text-ink">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className={btn.secondary} onClick={() => dialog.current?.close()} disabled={pending}>
              Cancel
            </button>
            <button type="button" className={btn.primary} onClick={run} disabled={pending}>
              {pending ? "Working..." : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
