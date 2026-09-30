"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { D, E, Flip, MQ } from "@/lib/motion";
import { buttonClass } from "@/components/ui/Button";
import { cx } from "@/components/ui/cx";

type Item = { id: string; tags: string[]; node: React.ReactNode };
type Props = { items: Item[]; tags: { slug: string; name: string; count: number }[]; pageSize?: number; label: string };

// The rest of a section's stories: an optional tag filter and "load more".
// Cards that stay on screen glide to their new slots with Flip; new ones are
// revealed by the site MotionScope when they mount.
export function SectionArchive({ items, tags, pageSize = 12, label }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [limit, setLimit] = useState(pageSize);
  const list = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const matching = active ? items.filter((i) => i.tags.includes(active)) : items;
  const shown = matching.slice(0, limit);
  const remaining = matching.length - shown.length;

  function capture() {
    if (!list.current || matchMedia(MQ.reduced).matches) return;
    flipState.current = Flip.getState(list.current.querySelectorAll(":scope > li"));
  }

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !list.current) return;
    flipState.current = null;
    Flip.from(state, {
      targets: list.current.querySelectorAll(":scope > li"),
      duration: D.base,
      ease: E.inOut,
      stagger: 0.03,
      nested: true,
      prune: true,
    });
  }, [active, limit]);

  function choose(slug: string | null) {
    if (slug === active) return;
    capture();
    setActive(slug);
    setLimit(pageSize);
  }

  return (
    <div>
      {tags.length > 1 ? (
        <div role="group" aria-label={`Filter ${label} by topic`} className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-b border-rule pb-4">
          <span className="font-sans text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">Topics</span>
          {[{ slug: null, name: "All", count: items.length }, ...tags].map((t) => {
            const on = active === t.slug;
            return (
              <button
                key={t.slug ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() => choose(t.slug)}
                className={cx(
                  "relative py-1 font-sans text-[12.5px] font-semibold tracking-[0.1em] uppercase transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[2px] after:origin-left after:bg-gold after:transition-transform after:duration-300 after:ease-press",
                  on ? "text-navy after:scale-x-100" : "text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-50 active:text-navy-deep",
                )}
              >
                {t.name}
                <span className="ml-1.5 font-normal tabular-nums text-ink-soft/80">{t.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ul ref={list} className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <li key={item.id} data-flip-id={item.id} className="min-w-0">
            {item.node}
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="sr-only">
        Showing {shown.length} of {matching.length} stories
      </p>

      {remaining > 0 ? (
        <div className="mt-14 flex items-center gap-6 border-t border-ink pt-8">
          <button
            type="button"
            onClick={() => {
              capture();
              setLimit((n) => n + pageSize);
            }}
            className={buttonClass("outline", "md")}
          >
            Load {Math.min(remaining, pageSize)} more
            <svg aria-hidden viewBox="0 0 10 12" className="h-[0.9em] w-[0.75em] transition-transform duration-300 ease-press group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 0v10M1 6l4 4 4-4" />
            </svg>
          </button>
          <span className="font-sans text-[12.5px] text-ink-soft">
            {shown.length} of {matching.length} shown
          </span>
        </div>
      ) : null}
    </div>
  );
}
