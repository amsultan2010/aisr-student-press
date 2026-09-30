import "server-only";
import type { serverClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof serverClient>>;

const MEDIA_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;

// Covers must be dashboard uploads or the bundled placeholder photos, the two
// sources next/image is configured for.
export function isAllowedImageUrl(url: string) {
  return url.startsWith(MEDIA_PREFIX) || /^\/placeholders\/[\w.-]+$/.test(url);
}

// Object paths inside the media bucket for URLs we uploaded; other URLs are skipped.
export function mediaPaths(urls: (string | null | undefined)[]) {
  return urls.flatMap((u) => (u && u.startsWith(MEDIA_PREFIX) ? [decodeURIComponent(u.slice(MEDIA_PREFIX.length))] : []));
}

export function bodyImageUrls(body: unknown): string[] {
  const out: string[] = [];
  const walk = (node: { type?: string; attrs?: { src?: string }; content?: unknown[] }) => {
    if (node?.type === "image" && node.attrs?.src) out.push(node.attrs.src);
    node?.content?.forEach((c) => walk(c as typeof node));
  };
  walk(body as Parameters<typeof walk>[0]);
  return out;
}

// Best effort: a leftover file is harmless, so failures are ignored.
export async function removeMedia(supabase: Client, urls: (string | null | undefined)[]) {
  const paths = mediaPaths(urls);
  if (paths.length) await supabase.storage.from("media").remove(paths);
}
