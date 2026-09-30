"use client";

import { useRef } from "react";
import { gsap, D, E, MQ, useGSAP } from "@/lib/motion";

// Desktop pointer layer (fine pointers only, never with reduced motion):
// 1. a small square cursor that trails the pointer and becomes a labelled
//    stamp ("Read") over anything with [data-cursor];
// 2. magnetic pull on anything with [data-magnetic];
// 3. a gentle 3D tilt on anything with [data-tilt].
export function PointerFX() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.pointer, () => {
        const cursor = ref.current!;
        const label = cursor.querySelector<HTMLElement>("[data-cursor-label]")!;
        const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
        gsap.set(cursor, { autoAlpha: 0 });

        const grow = gsap
          .timeline({ paused: true, defaults: { duration: D.fast, ease: E.out } })
          .to(cursor, { width: 76, height: 76, backgroundColor: "var(--color-navy)", ease: E.out })
          .fromTo(label, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1 }, 0.05);

        let over: Element | null = null;
        let magnet: HTMLElement | null = null;
        const magnets = new WeakMap<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
        const pull = (el: HTMLElement) => {
          let m = magnets.get(el);
          if (!m) {
            m = { x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" }) };
            magnets.set(el, m);
          }
          return m;
        };

        let tilted: HTMLElement | null = null;
        const tilts = new WeakMap<HTMLElement, { rx: gsap.QuickToFunc; ry: gsap.QuickToFunc }>();
        const tilt = (el: HTMLElement) => {
          let t = tilts.get(el);
          if (!t) {
            gsap.set(el, { transformPerspective: 900 });
            t = {
              rx: gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" }),
              ry: gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" }),
            };
            tilts.set(el, t);
          }
          return t;
        };

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
          const target = e.target instanceof Element ? e.target : null;
          const card = target?.closest("[data-cursor]") ?? null;
          // The stamp sits below-right of the pointer so it never covers the headline being read.
          const offset = card ? 52 : 0;
          xTo(e.clientX + offset);
          yTo(e.clientY + offset);

          if (card !== over) {
            over = card;
            if (card) {
              label.textContent = (card as HTMLElement).dataset.cursor || "Read";
              grow.play();
            } else grow.reverse();
          }
          // Plain links and buttons: shrink out of the way of the native pointer.
          const interactive = !card && target?.closest("a,button,input,textarea,select,label");
          gsap.to(cursor, { scale: interactive ? 0 : 1, duration: D.fast, overwrite: "auto" });

          const m = (target?.closest("[data-magnetic]") as HTMLElement | null) ?? null;
          if (magnet && magnet !== m) {
            pull(magnet).x(0);
            pull(magnet).y(0);
          }
          magnet = m;
          if (m) {
            const r = m.getBoundingClientRect();
            pull(m).x((e.clientX - (r.left + r.width / 2)) * 0.3);
            pull(m).y((e.clientY - (r.top + r.height / 2)) * 0.35);
          }

          const t = (target?.closest("[data-tilt]") as HTMLElement | null) ?? null;
          if (tilted && tilted !== t) {
            tilt(tilted).rx(0);
            tilt(tilted).ry(0);
          }
          tilted = t;
          if (t) {
            const r = t.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            tilt(t).ry(nx * 8);
            tilt(t).rx(-ny * 8);
          }
        };
        const onLeave = () => {
          gsap.to(cursor, { autoAlpha: 0, duration: 0.2 });
          if (magnet) {
            pull(magnet).x(0);
            pull(magnet).y(0);
            magnet = null;
          }
          if (tilted) {
            tilt(tilted).rx(0);
            tilt(tilted).ry(0);
            tilted = null;
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed top-0 left-0 z-[90] flex size-2.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-ink max-[899px]:hidden"
    >
      <span data-cursor-label className="invisible font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-paper">
        Read
      </span>
    </div>
  );
}
