"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Inline boot script that exists only in server HTML. During hydration the
// server snapshot (false) keeps the tag matched; on a fresh client render
// (Next's error-shell 404s) nothing is rendered, because React never runs
// client-created <script> tags and warns about them.
export function MotionBoot({ code }: { code: string }) {
  const client = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return client ? null : <script id="motion-boot" dangerouslySetInnerHTML={{ __html: code }} />;
}
