"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { SITE } from "@/lib/site";
import { cx } from "@/components/ui/cx";

const noop = () => () => {};
const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

type Props = { url: string; title: string; layout?: "rail" | "row"; className?: string };

// Copy link, the device share sheet (where supported) and the Press Instagram.
export function ShareBar({ url, title, layout = "row", className }: Props) {
  const share = useSyncExternalStore(noop, canShare, () => false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rail = layout === "rail";

  async function onCopy() {
    const ok = await copy(url);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }

  async function onShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Dismissed by the reader.
    }
  }

  const btn = cx(
    "group inline-flex items-center gap-3 font-sans text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors",
    "text-ink hover:text-navy active:text-navy-deep disabled:opacity-45",
  );
  const disc = cx(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ink/25 transition-colors duration-200",
    "group-hover:border-ink group-hover:bg-ink group-hover:text-paper group-active:bg-navy-deep",
  );
  const label = rail ? "sr-only" : "";

  return (
    <div className={cx(rail ? "flex flex-col items-center gap-3" : "flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      <p className={cx("font-sans text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase", rail ? "mb-1" : "w-full sm:w-auto")}>Share</p>
      <button type="button" onClick={onCopy} className={btn} aria-label={rail ? (copied ? "Link copied" : "Copy link") : undefined}>
        <span className={disc}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </span>
        <span className={label}>{copied ? "Link copied" : "Copy link"}</span>
      </button>
      {share ? (
        <button type="button" onClick={onShare} className={btn} aria-label={rail ? "Share this story" : undefined}>
          <span className={disc}>
            <ShareIcon />
          </span>
          <span className={label}>Share</span>
        </button>
      ) : null}
      <a
        href={SITE.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label={rail ? `Follow ${SITE.instagramHandle} on Instagram` : undefined}
      >
        <span className={disc}>
          <InstagramIcon />
        </span>
        <span className={label}>Instagram</span>
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}

const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true };

function LinkIcon() {
  return (
    <svg {...icon}>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...icon}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg {...icon}>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 12v8h14v-8" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...icon}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
