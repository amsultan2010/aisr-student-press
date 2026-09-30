"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, MQ, useGSAP } from "@/lib/motion";

export type TickerItem = { id: string; href: string; title: string; section: string };

const PX_PER_SECOND = { desktop: 70, mobile: 45 };

function Items({ items, hidden }: { items: TickerItem[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden || undefined} inert={hidden || undefined} data-ticker-copy={hidden ? "" : undefined}>
      {items.map((item) => (
        <li key={item.id} className="flex shrink-0 items-center">
          <Link
            href={item.href}
            className="group flex h-10 items-center gap-3 px-5 outline-offset-[-3px] transition-colors duration-200 hover:bg-navy active:bg-ink"
          >
            <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold">{item.section}</span>
            <span className="whitespace-nowrap font-serif text-[15px] text-paper underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-gold-soft">
              {item.title}
            </span>
          </Link>
          <span aria-hidden className="size-[5px] rotate-45 bg-gold/70" />
        </li>
      ))}
    </ul>
  );
}

// "Moving banner at the top": a gap-free GSAP marquee. The track holds two
// identical lists and loops xPercent 0 to -50. Scroll velocity nudges the
// speed; hover and keyboard focus ease it to a stop. Static in reduced motion.
export function Ticker({ items }: { items: TickerItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current!;
      const viewport = root.querySelector<HTMLElement>("[data-ticker-viewport]")!;
      const track = root.querySelector<HTMLElement>("[data-ticker-track]")!;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const speed = ctx.conditions?.desktop ? PX_PER_SECOND.desktop : PX_PER_SECOND.mobile;
        const loop = gsap.to(track, {
          xPercent: -50,
          ease: "none",
          repeat: -1,
          duration: track.scrollWidth / 2 / speed,
        });
        let paused = false;
        const glide = (to: number, duration = 0.6) => gsap.to(loop, { timeScale: to, duration, ease: "power2.out", overwrite: true });

        // Scroll velocity gives the tape a push, then it settles back.
        const nudge = ScrollTrigger.create({
          onUpdate: (self) => {
            if (paused) return;
            const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 400);
            gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
          },
        });

        const pause = () => {
          paused = true;
          glide(0, 0.5);
        };
        const resume = () => {
          paused = false;
          glide(1, 0.8);
        };
        const focusIn = () => {
          // Keyboard users get a still row they can tab through.
          paused = true;
          loop.pause();
          loop.progress(0);
          loop.timeScale(0);
        };
        const focusOut = (e: FocusEvent) => {
          if (viewport.contains(e.relatedTarget as Node)) return;
          viewport.scrollLeft = 0;
          loop.play();
          resume();
        };
        viewport.addEventListener("pointerenter", pause);
        viewport.addEventListener("pointerleave", resume);
        viewport.addEventListener("focusin", focusIn);
        viewport.addEventListener("focusout", focusOut);
        return () => {
          nudge.kill();
          viewport.removeEventListener("pointerenter", pause);
          viewport.removeEventListener("pointerleave", resume);
          viewport.removeEventListener("focusin", focusIn);
          viewport.removeEventListener("focusout", focusOut);
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  if (!items.length) return null;

  return (
    <section ref={ref} aria-label="Latest headlines" className="relative z-50 flex h-10 bg-navy-deep text-paper">
      <p className="flex shrink-0 items-center gap-2 bg-gold px-4 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-ink sm:px-5">
        <span aria-hidden className="size-1.5 animate-pulse bg-navy-deep motion-reduce:animate-none" />
        Latest
      </p>
      <div
        data-ticker-viewport
        className="relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]"
      >
        <div data-ticker-track className="flex w-max">
          <Items items={items} />
          <div className="flex motion-reduce:hidden">
            <Items items={items} hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
