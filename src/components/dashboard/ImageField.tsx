"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/dashboard/upload";
import { btn, field } from "./ui";

// Upload, preview, replace and remove one image in the media bucket.
export function ImageField({
  label,
  value,
  onChange,
  folder,
  aspect = "aspect-[16/10]",
  round = false,
  error,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: "covers" | "staff";
  aspect?: string;
  round?: boolean;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const id = useId();
  const message = uploadError ?? error;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className={field.label}>
        {label}
      </p>
      <div
        className={`relative mt-1.5 overflow-hidden border border-rule bg-paper-2 ${aspect} ${round ? "mx-auto w-40 rounded-full" : "w-full"}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <Image src={value} alt="" fill sizes={round ? "160px" : "(min-width: 1024px) 360px, 100vw"} className="object-cover" />
        ) : (
          <div className="grid size-full place-items-center p-4 text-center font-sans text-[13px] text-ink-soft">
            {busy ? "Uploading..." : "No image yet. Drop a file here or choose one."}
          </div>
        )}
        {busy && value ? (
          <div className="absolute inset-0 grid place-items-center bg-paper/80 font-sans text-sm text-ink">Uploading...</div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={btn.quiet} onClick={() => input.current?.click()} disabled={busy}>
          {value ? "Replace" : "Upload image"}
        </button>
        {value ? (
          <button type="button" className={btn.quiet} onClick={() => onChange(null)} disabled={busy}>
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {message ? (
        <p role="alert" className={field.error}>
          {message}
        </p>
      ) : (
        <p className={field.hint}>JPG, PNG, WebP, AVIF or GIF, up to 10 MB.</p>
      )}
    </div>
  );
}
