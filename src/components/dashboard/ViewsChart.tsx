"use client";

import { useState } from "react";

type Point = { day: string; views: number };

const W = 600;
const H = 200;
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const label = (day: string, fmt = dayFmt) => fmt.format(new Date(`${day}T00:00:00Z`));

// Rounds the axis top up to 1, 2 or 5 times a power of ten.
function niceMax(n: number) {
  if (n <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(n));
  return ([1, 2, 5, 10].find((m) => m * p >= n) ?? 10) * p;
}

// Daily views as a single-series area chart. Drawn in a stretched viewBox;
// all text, the crosshair and the marker are HTML so nothing distorts.
export function ViewsChart({ series }: { series: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...series.map((d) => d.views)));
  const n = series.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => H - (v / max) * H;
  const line = series.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;
  const empty = series.every((d) => d.views === 0);
  const point = active === null ? null : series[active];

  function pick(clientX: number, rect: DOMRect) {
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setActive(Math.round(f * (n - 1)));
  }

  if (!n) return null;

  return (
    <figure className="m-0">
      <div className="flex gap-3">
        <div aria-hidden="true" className="relative w-8 shrink-0 font-sans text-[11px] tabular-nums text-ink-soft">
          {[max, max / 2, 0].map((v, i) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${i * 50}%` }}>
              {v}
            </span>
          ))}
        </div>
        <div
          role="img"
          aria-label={`Daily views for the last ${n} days. Hover or use the arrow keys to read each day.`}
          tabIndex={0}
          className="relative h-52 min-w-0 flex-1 cursor-crosshair touch-pan-y sm:h-60"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? n) - 1));
            else if (e.key === "ArrowRight") setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
            else return;
            e.preventDefault();
          }}
        >
          {[0, 50, 100].map((t) => (
            <div key={t} className="absolute inset-x-0 h-px bg-rule" style={{ top: `${t}%` }} />
          ))}
          <div data-reveal="clip" className="absolute inset-0">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full overflow-visible">
              <path d={area} className="fill-navy/10" />
              <path
                d={line}
                fill="none"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="stroke-navy"
              />
            </svg>
          </div>
          {empty ? (
            <p className="absolute left-4 top-6 max-w-xs font-sans text-sm text-ink-soft">
              No views in the last {n} days yet. They show up here as soon as readers open published articles.
            </p>
          ) : null}
          {point && active !== null ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 w-px bg-ink/40" style={{ left: `${(x(active) / W) * 100}%` }} />
              <div
                className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-navy"
                style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(point.views) / H) * 100}%` }}
              />
              <div
                className="pointer-events-none absolute top-2 z-10 whitespace-nowrap border border-ink bg-cream px-2.5 py-1.5 font-sans text-[12px] text-ink shadow-[3px_3px_0_var(--color-rule)]"
                style={{
                  left: `${(x(active) / W) * 100}%`,
                  transform: `translateX(${active > n * 0.7 ? "calc(-100% - 10px)" : active < n * 0.3 ? "10px" : "-50%"})`,
                }}
              >
                <span className="text-ink-soft">{label(point.day, longFmt)}</span>{" "}
                <strong className="font-semibold tabular-nums">
                  {point.views} {point.views === 1 ? "view" : "views"}
                </strong>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div aria-hidden="true" className="ml-11 mt-2 flex justify-between font-sans text-[11px] text-ink-soft">
        <span>{label(series[0].day)}</span>
        <span>{label(series[Math.floor((n - 1) / 2)].day)}</span>
        <span>{label(series[n - 1].day)}</span>
      </div>
      <table className="sr-only">
        <caption>Views per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Views</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d) => (
            <tr key={d.day}>
              <td>{label(d.day, longFmt)}</td>
              <td>{d.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
