"use client";

import { useEffect } from "react";
import { browserClient } from "@/lib/supabase/client";

const KEY = "press-visitor";
// Once per story per page load (also absorbs the dev-mode double effect).
const sent = new Set<string>();

// Anonymous per-browser id, so one reader counts once per story per 30 minutes
// (the dedupe window lives in the record_view function).
function visitorId() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved.length >= 8 && saved.length <= 64) return saved;
    const fresh = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

export function ViewRecorder({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (sent.has(articleId)) return;
    sent.add(articleId);
    browserClient()
      .rpc("record_view", { p_article_id: articleId, p_visitor: visitorId() })
      .then(
        () => undefined,
        () => undefined,
      );
  }, [articleId]);
  return null;
}
