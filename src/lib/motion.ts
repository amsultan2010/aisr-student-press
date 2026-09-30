"use client";

// The only place GSAP is imported. Components import from "@/lib/motion".
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, CustomEase, useGSAP);

// Signature eases, used everywhere by name.
CustomEase.create("press", "0.16, 1, 0.3, 1");
CustomEase.create("pressInOut", "0.65, 0, 0.35, 1");

export const D = { fast: 0.35, base: 0.7, slow: 1.1, epic: 1.6 } as const;
export const E = { out: "press", inOut: "pressInOut", pop: "back.out(1.7)" } as const;

gsap.defaults({ ease: E.out, duration: D.base });

// Breakpoint queries for gsap.matchMedia(). Reduced motion gets its own branch.
export const MQ = {
  desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  pointer: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, useGSAP };
