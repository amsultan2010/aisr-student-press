import { browserClient } from "@/lib/supabase/client";

// Mirrors the media bucket's limits so editors get a clear message before upload.
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_BYTES = 10 * 1024 * 1024;

export const IMAGE_ACCEPT = Object.keys(TYPES).join(",");

// Uploads straight from the browser to the public media bucket. Storage RLS
// only accepts the upload from an editor's session.
export async function uploadImage(file: File, folder: "covers" | "staff" | "body") {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Use a JPG, PNG, WebP, AVIF or GIF image.");
  if (file.size > MAX_BYTES) throw new Error("That image is over 10 MB. Export a smaller copy and try again.");

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const media = browserClient().storage.from("media");
  const { error } = await media.upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return media.getPublicUrl(path).data.publicUrl;
}
