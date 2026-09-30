"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, D, E, MQ, useGSAP } from "@/lib/motion";
import { MOTION_SELECTOR } from "./motion-attrs";

/*
  Site-wide motion vocabulary, driven by data attributes. The (site) layout
  wraps every page in one MotionScope, so pages only mark elements:

    data-split="lines" | "chars"   display text: masked split, staggered up
    data-cover  (+ data-cover-inner)  image frame: clip-path wipe + overscale
    data-parallax="6"               scrubbed yPercent drift (on data-cover-inner)
    data-drift="60"                 scrubbed y from +60px to -60px across the viewport
                                    (give neighbours different values for depth)
    data-card                       batched stagger-in (ScrollTrigger.batch)
    data-rule                       hairline draws in with scaleX from the left
                                    (data-rule="y": vertical rule, scaleY from the top)
    data-rise                       small blocks (deks, bylines): short masked rise
    data-draw                       SVG line art (paths inside) drawn on
                                    (data-draw="fill": the fill fades in after the stroke)
    data-count                      a real number in the text counts up from 0
    data-spin="60"                  ambient rotation, one turn per N seconds

  The layout hides split/cover/card/rise elements before hydration when motion
  is on, and this component makes every one of them visible again. Elements
  added later (load more, filters) are revealed by a MutationObserver.
*/


type Params = { travel: number; dur: number; stagger: number; start: string; parallax: number };

const DESKTOP: Params = { travel: 40, dur: D.slow, stagger: 0.08, start: "top 88%", parallax: 1 };
const MOBILE: Params = { travel: 24, dur: D.base, stagger: 0.05, start: "top 92%", parallax: 0.5 };

function show(targets: gsap.TweenTarget) {
  gsap.set(targets, { visibility: "visible", opacity: 1 });
}

function once(trigger: Element, p: Params) {
  return { trigger, start: p.start, once: true } satisfies ScrollTrigger.Vars;
}

// Timelines get their trigger separately: a scrollTrigger inside timeline
// vars initialises a tick late, and ScrollTriggers created meanwhile force it
// to refresh, which breaks when the page is already scrolled past it.
function playOnce(tl: gsap.core.Timeline, trigger: Element, p: Params) {
  ScrollTrigger.create({ ...once(trigger, p), onEnter: () => tl.play() });
}

function build(root: HTMLElement, p: Params) {
  const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);

  q("[data-split]").forEach((el) => {
    const chars = el.dataset.split === "chars";
    show(el);
    SplitText.create(el, {
      type: chars ? "lines,words,chars" : "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(chars ? self.chars : self.lines, {
          yPercent: 115,
          duration: chars ? p.dur * 0.9 : p.dur,
          stagger: chars ? 0.018 : p.stagger,
          ease: E.out,
          scrollTrigger: once(el, p),
        }),
    });
  });

  q("[data-cover]").forEach((frame) => {
    show(frame);
    const inner = frame.querySelector("[data-cover-inner]");
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      frame,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: D.epic * 0.8, ease: E.inOut, clearProps: "clipPath" },
    );
    if (inner) tl.from(inner, { scale: 1.28, duration: D.epic, ease: E.out }, 0);
    playOnce(tl, frame, p);
  });

  q("[data-parallax]").forEach((inner) => {
    const amount = Number(inner.dataset.parallax) * p.parallax;
    if (!amount) return;
    gsap.fromTo(
      inner,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: inner.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  });

  const cards = q("[data-card]");
  if (cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: p.travel });
    ScrollTrigger.batch(cards, {
      start: p.start,
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: p.dur, stagger: p.stagger, ease: E.out, overwrite: "auto" }),
    });
  }

  q("[data-rise]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: p.travel * 0.6 },
      { autoAlpha: 1, y: 0, duration: p.dur, ease: E.out, scrollTrigger: once(el, p) },
    );
  });

  q("[data-rule]").forEach((el) => {
    const vertical = el.dataset.rule === "y";
    gsap.from(el, {
      ...(vertical ? { scaleY: 0, transformOrigin: "center top" } : { scaleX: 0, transformOrigin: "left center" }),
      duration: D.epic,
      ease: E.inOut,
      scrollTrigger: once(el, p),
    });
  });

  q("[data-drift]").forEach((el) => {
    const px = Number(el.dataset.drift) * p.parallax;
    if (!px) return;
    gsap.fromTo(
      el,
      { y: px },
      { y: -px, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } },
    );
  });

  q("[data-spin]").forEach((el) => {
    gsap.to(el, { rotate: 360, duration: Number(el.dataset.spin) || 60, ease: "none", repeat: -1 });
  });

  q("[data-draw]").forEach((svg) => {
    const paths = svg.querySelectorAll("path, line, circle, polyline, rect");
    const tl = gsap.timeline({ paused: true });
    tl.from(paths, { drawSVG: "0%", duration: D.epic, ease: E.inOut, stagger: 0.12 });
    if (svg.dataset.draw === "fill") tl.from(paths, { fillOpacity: 0, duration: D.slow, ease: E.out }, "-=0.5");
    playOnce(tl, svg, p);
  });

  const counted: [HTMLElement, string][] = [];
  q("[data-count]").forEach((el) => {
    // Remember the real value once: re-runs (resize, StrictMode) must not read a mid-count number.
    const original = (el.dataset.countValue ??= el.textContent ?? "");
    const target = Number(original.replace(/[^\d]/g, ""));
    if (!Number.isFinite(target) || target <= 0) return;
    counted.push([el, original]);
    const counter = { n: 0 };
    el.textContent = "0";
    gsap.to(counter, {
      n: target,
      duration: D.epic,
      ease: "power2.out",
      snap: { n: 1 },
      onUpdate: () => {
        el.textContent = String(counter.n);
      },
      scrollTrigger: once(el, p),
    });
  });

  return () => counted.forEach(([el, original]) => (el.textContent = original));
}

export function MotionScope({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = ref.current!;
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => build(root, DESKTOP));
      mm.add(MQ.mobile, () => build(root, MOBILE));
      mm.add(MQ.reduced, () => show(gsap.utils.toArray(MOTION_SELECTOR, root)));

      // Anything rendered after this pass (client lists, filters) is shown
      // with a short rise instead of staying hidden.
      const seen = new WeakSet<Element>(gsap.utils.toArray(MOTION_SELECTOR, root));
      const observer = new MutationObserver((records) => {
        const fresh: Element[] = [];
        for (const r of records) {
          r.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            const found = node.matches(MOTION_SELECTOR) ? [node] : [];
            found.push(...node.querySelectorAll(MOTION_SELECTOR));
            for (const el of found) {
              if (seen.has(el)) continue;
              seen.add(el);
              fresh.push(el);
            }
          });
        }
        if (!fresh.length) return;
        if (matchMedia(MQ.reduced).matches) return show(fresh);
        gsap.fromTo(fresh, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: D.base, stagger: 0.04, ease: E.out });
      });
      observer.observe(root, { childList: true, subtree: true });

      ScrollTrigger.refresh();

      return () => {
        observer.disconnect();
        mm.revert();
      };
    },
    { scope: ref, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={ref} data-site-motion className={className}>
      {children}
    </div>
  );
}
