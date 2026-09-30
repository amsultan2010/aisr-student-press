"use client";

import { useRef } from "react";
import { MQ, gsap, useGSAP } from "@/lib/motion";

// Thin gold bar across the top of the viewport, scrubbed to how far the
// reader is through the story body (the element with id `targetId`).
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const target = document.getElementById(targetId);
    if (!target || !bar.current) return;
    const mm = gsap.matchMedia();
    const build = (scrub: number | true) => {
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: target,
            start: "top 70%",
            end: () => `bottom ${Math.round(window.innerHeight * 0.85)}px`,
            scrub,
            invalidateOnRefresh: true,
          },
        },
      );
    };
    mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => build(0.5));
    // Still useful with reduced motion: it tracks position, it does not travel.
    mm.add(MQ.reduced, () => build(true));
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gold" />
    </div>
  );
}
