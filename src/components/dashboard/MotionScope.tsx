"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, D, E } from "@/lib/motion";

// Entrance motion for the sign-in page and the dashboard overview. Children opt
// in with data-reveal="split | rule | up | seal | count | clip". Every
// branch makes its targets visible first, so nothing stays hidden.
export function MotionScope({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      (window as unknown as { __pressMotion?: boolean }).__pressMotion = true;
      const root = ref.current;
      if (!root) return;
      const all = (kind: string) => gsap.utils.toArray<HTMLElement>(`[data-reveal="${kind}"]`, root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduced: MQ.reduced }, (ctx) => {
        const everything = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
        if (ctx.conditions?.reduced) {
          gsap.set(everything, { visibility: "visible" });
          return;
        }
        // Counters stay hidden until their tween starts, so a paused tab never
        // shows a zero in place of the real number.
        gsap.set(
          everything.filter((el) => el.dataset.reveal !== "count"),
          { visibility: "visible" },
        );

        const desktop = Boolean(ctx.conditions?.desktop);
        const travel = desktop ? 1 : 0.6;
        const dur = desktop ? D.slow : D.base;

        all("split").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 110, duration: dur, stagger: 0.08, ease: E.out }),
          });
        });

        gsap.from(all("rule"), {
          scaleX: 0,
          transformOrigin: "left center",
          duration: D.slow,
          ease: E.inOut,
          delay: 0.15,
        });

        gsap.from(all("seal"), { rotate: -25, scale: 0.8, autoAlpha: 0, duration: D.slow, ease: E.out });

        gsap.from(all("up"), {
          y: 18 * travel,
          autoAlpha: 0,
          duration: D.base,
          stagger: 0.06,
          delay: 0.2,
        });

        // Explicit end value: clip-path cannot interpolate towards "none".
        gsap.fromTo(
          all("clip"),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: D.epic, ease: E.inOut, delay: 0.2 },
        );

        all("count").forEach((el) => {
          const target = Number(el.dataset.value);
          if (!Number.isFinite(target) || target === 0) {
            gsap.set(el, { visibility: "visible" });
            return;
          }
          const counter = { n: 0 };
          const format = new Intl.NumberFormat("en-GB");
          gsap.to(counter, {
            n: target,
            duration: D.slow,
            ease: E.out,
            snap: { n: 1 },
            onStart: () => gsap.set(el, { visibility: "visible" }),
            onUpdate: () => {
              el.textContent = format.format(counter.n);
            },
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
