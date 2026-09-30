"use client";

import { useEffect, useRef } from "react";
import { formatDateline } from "@/lib/format";

// Server renders the date at build/revalidate time; the client corrects it
// after mount (Riyadh time) without a hydration mismatch.
export function Dateline({ initial }: { initial: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const now = formatDateline();
    if (ref.current && ref.current.textContent !== now) ref.current.textContent = now;
  }, []);
  return <span ref={ref}>{initial}</span>;
}
