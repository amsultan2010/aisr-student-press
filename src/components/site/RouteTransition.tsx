"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { Mark } from "@/components/ui/Mark";
import { gsap, D, E, MQ, useGSAP } from "@/lib/motion";
import { scrollToTop } from "./SiteMotion";

// Covers client-side navigations with a navy wipe so pages never blink:
// internal link clicks are held while the panel rises, the route is pushed
// under it, and the panel exits upward once the new pathname renders.
// Reduced motion: links behave normally (Next handles scroll).
function lift(panel: HTMLElement) {
  gsap
    .timeline()
    .to(panel, { yPercent: -100, duration: D.slow * 0.8, ease: E.inOut, delay: 0.08 })
    .set(panel, { visibility: "hidden", yPercent: 100 });
}

export function RouteTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef(false);

  useGSAP(
    () => {
      const panel = ref.current!;
      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (matchMedia(MQ.reduced).matches) return;
        const a = (e.target as Element | null)?.closest?.("a[href]");
        if (!(a instanceof HTMLAnchorElement)) return;
        if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition != null) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname) return; // same page, hash or query change
        if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/login") || url.pathname.startsWith("/auth")) return;

        e.preventDefault();
        pending.current = true;
        const href = url.pathname + url.search + url.hash;
        gsap
          .timeline()
          .set(panel, { visibility: "visible", yPercent: 100 })
          .to(panel, { yPercent: 0, duration: D.base * 0.8, ease: E.inOut })
          .from("[data-transition-rule]", { scaleX: 0, transformOrigin: "left center", duration: D.base, ease: E.inOut }, 0.15)
          .add(() => {
            scrollToTop();
            router.push(href, { scroll: false });
          });
        // Never leave the panel up if the navigation stalls or fails.
        gsap.delayedCall(8, () => {
          if (!pending.current) return;
          pending.current = false;
          lift(panel);
        });
      };
      window.addEventListener("click", onClick, true);
      return () => window.removeEventListener("click", onClick, true);
    },
    { scope: ref },
  );

  // New route rendered: lift the panel.
  useGSAP(
    () => {
      if (!pending.current) return;
      pending.current = false;
      lift(ref.current!);
    },
    { dependencies: [pathname] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-deep text-paper"
    >
      <Mark variant="plain" tone="paper" className="w-16" />
      <span data-transition-rule className="mt-6 block h-px w-40 bg-gold" />
    </div>
  );
}
