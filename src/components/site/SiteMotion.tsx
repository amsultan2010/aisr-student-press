"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

// Shared handle so the menu and route transitions can stop or jump the scroll.
let lenis: Lenis | null = null;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

declare global {
  interface Window {
    __pressMotion?: boolean;
  }
}

// Global motion plumbing: tells the boot script the app hydrated, runs Lenis
// (desktop and mobile, never with reduced motion) in sync with ScrollTrigger,
// and refreshes triggers once web fonts settle.
export function SiteMotion() {
  useGSAP(() => {
    window.__pressMotion = true;
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const instance = new Lenis({ lerp: 0.14, anchors: true });
      lenis = instance;
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        instance.destroy();
        lenis = null;
      };
    });
    return () => mm.revert();
  });
  return null;
}
