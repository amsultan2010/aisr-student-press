"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteSubmission, setSubmissionStatus } from "@/lib/dashboard/submissions";
import { ConfirmButton } from "./ConfirmButton";
import { btn, field } from "./ui";

const LABELS = { new: "Mark as new", read: "Mark as read", archived: "Archive" } as const;

export function SubmissionActions({ id, status, from }: { id: string; status: string; from: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Opening a new submission marks it read, once per visit, so "Mark as new"
  // sticks. Done here rather than in the page render so link prefetching can
  // never mark something read unseen.
  const openedAs = useRef(status);
  useEffect(() => {
    if (openedAs.current === "new") setSubmissionStatus(id, "read");
  }, [id]);

  function change(next: keyof typeof LABELS) {
    start(async () => {
      const res = await setSubmissionStatus(id, next);
      setError(res.ok ? null : res.error);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LABELS) as (keyof typeof LABELS)[])
          .filter((s) => s !== status && !(status === "new" && s === "read"))
          .map((s) => (
            <button key={s} type="button" className={btn.quiet} disabled={pending} onClick={() => change(s)}>
              {LABELS[s]}
            </button>
          ))}
        <ConfirmButton
          label="Delete"
          title="Delete this submission?"
          redirectTo="/dashboard/submissions"
          action={() => deleteSubmission(id)}
        >
          <p>The message from {from} and any attached file are deleted for good.</p>
        </ConfirmButton>
      </div>
      {error ? (
        <p role="alert" className={field.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
