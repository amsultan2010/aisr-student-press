"use client";

import { useRef } from "react";
import { D, E, MQ, SplitText, gsap, useGSAP } from "@/lib/motion";

// The only motion inside a story body: pull quotes (blockquotes) rise in line
// by line as they reach the reader, with their rules drawn in. Paragraphs,
// images and headings stay still so reading is never interrupted.
export function BodyMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const quotes = gsap.utils.toArray<HTMLElement>("blockquote", ref.current);
      if (!quotes.length) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        quotes.forEach((q) => {
          SplitText.create(q.querySelectorAll("p"), {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: D.slow,
                stagger: 0.07,
                ease: E.out,
                scrollTrigger: { trigger: q, start: "top 80%", once: true },
              }),
          });
          gsap.fromTo(
            q,
            { "--rule": 0 },
            { "--rule": 1, duration: D.epic, ease: E.inOut, scrollTrigger: { trigger: q, start: "top 80%", once: true } },
          );
        });
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
