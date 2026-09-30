import Image from "next/image";
import { cx } from "./cx";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  /** Pixel size of the circle. */
  size?: number;
  /** "paper" for use on navy bands. */
  tone?: "ink" | "paper";
  className?: string;
};

// Round staff photo, or a serif monogram when there is no photo yet.
export function Avatar({ name, photoUrl, size = 40, tone = "ink", className }: AvatarProps) {
  const style = { width: size, height: size };
  if (photoUrl) {
    return (
      <span className={cx("relative inline-block shrink-0 overflow-hidden rounded-full bg-paper-2", className)} style={style}>
        <Image src={photoUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-serif italic leading-none",
        tone === "paper" ? "bg-gold-soft/15 text-gold-soft ring-1 ring-gold-soft/50" : "bg-navy text-paper ring-1 ring-navy",
        className,
      )}
      style={{ ...style, fontSize: Math.round(size * 0.4) }}
    >
      {initials(name)}
    </span>
  );
}
