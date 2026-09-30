import Image from "next/image";
import { cx } from "./cx";
import { Mark } from "./Mark";

type CoverImageProps = {
  src: string | null;
  alt: string;
  /** Required by next/image for responsive sizing, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /** CSS aspect ratio, e.g. "16/10", "3/2", "4/5". */
  ratio?: string;
  /** Load eagerly with high priority (use for the first big image on a page). */
  preload?: boolean;
  caption?: string;
  credit?: string;
  /** Mark for MotionScope's clip + overscale reveal. */
  reveal?: boolean;
  /** Scrubbed parallax strength in yPercent, e.g. 6. The image is oversized to hide the travel. */
  parallax?: number;
  /** Zoom the image slightly when a parent `group` is hovered. */
  hoverZoom?: boolean;
  tone?: "ink" | "paper";
  className?: string;
};

// next/image in a fixed-ratio frame. The frame clips; the inner layer is what
// MotionScope scales and moves, so reveals and parallax never show gaps.
export function CoverImage({
  src,
  alt,
  sizes,
  ratio = "3/2",
  preload,
  caption,
  credit,
  reveal = true,
  parallax,
  hoverZoom = true,
  tone = "ink",
  className,
}: CoverImageProps) {
  const frame = (
    <div
      data-cover={reveal ? "" : undefined}
      data-reveal={reveal ? "" : undefined}
      className="relative overflow-hidden bg-paper-2"
      style={{ aspectRatio: ratio }}
    >
      <div
        data-cover-inner
        data-parallax={parallax || undefined}
        className={cx("absolute inset-x-0", parallax ? "-top-[8%] -bottom-[8%]" : "inset-y-0")}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            className={cx("object-cover", hoverZoom && "transition-transform duration-[900ms] ease-press group-hover:scale-[1.035]")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Mark className="w-[18%] min-w-10 max-w-24 opacity-30" />
          </div>
        )}
      </div>
    </div>
  );

  if (!caption && !credit) return <div className={className}>{frame}</div>;

  return (
    <figure className={className}>
      {frame}
      <figcaption className={cx("mt-2.5 font-sans text-[12.5px] leading-snug", tone === "paper" ? "text-paper/70" : "text-ink-soft")}>
        {caption}
        {credit && (
          <span className={cx("ml-2 text-[11px] uppercase tracking-[0.1em]", tone === "paper" ? "text-paper/60" : "text-ink-soft/90")}>
            {credit}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
