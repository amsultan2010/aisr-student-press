"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";
import { gsap, SplitText, D, E, MQ, useGSAP } from "@/lib/motion";
import { Dateline } from "./Dateline";
import { InstagramIcon, SearchIcon } from "./icons";

// Utility row + nameplate. The sticky nav is a separate sibling (NavBar) so
// it can stay stuck for the whole page.
export function Masthead({ dateline }: { dateline: string }) {
  const ref = useRef<HTMLElement>(null);
  // The nameplate is the page's h1 on the homepage only.
  const isHome = usePathname() === "/";
  const Title = isHome ? "h1" : "div";

  // Switching h1/div remounts the nameplate after the intro has played; show
  // the new node as-is instead of leaving it hidden by [data-reveal].
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-nameplate]")?.style.setProperty("visibility", "visible");
  }, [isHome]);

  useGSAP(
    () => {
      const root = ref.current!;
      const title = root.querySelector<HTMLElement>("[data-nameplate]")!;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const desk = Boolean(ctx.conditions?.desktop);
        gsap.set(root.querySelectorAll("[data-reveal]"), { visibility: "visible" });
        const split = SplitText.create(title, { type: "lines,words,chars", mask: "lines" });
        const tl = gsap.timeline({ defaults: { ease: E.out } });
        tl.from(split.chars, { yPercent: 118, duration: desk ? D.epic : D.slow, stagger: desk ? 0.028 : 0.02 })
          .from("[data-mast-rule]", { scaleX: 0, transformOrigin: "left center", duration: D.epic, ease: E.inOut, stagger: 0.12 }, 0.15)
          .from("[data-mast-gold]", { scaleX: 0, transformOrigin: "center", duration: D.slow, ease: E.inOut }, 0.7)
          .from("[data-mast-side]", { autoAlpha: 0, y: 14, duration: D.slow, stagger: 0.1 }, 0.45)
          .from("[data-mast-seal]", { autoAlpha: 0, rotate: -120, scale: 0.6, duration: D.epic }, 0.3);

        // The seal turns slowly forever: the masthead's ambient motion.
        if (desk) gsap.to("[data-mast-seal] img", { rotate: 360, duration: 90, ease: "none", repeat: -1 });
        return () => split.revert();
      });
      mm.add(MQ.reduced, () => {
        gsap.set(root.querySelectorAll("[data-reveal]"), { visibility: "visible" });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <header ref={ref} className="relative bg-paper">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 font-sans text-[11px] text-ink-soft sm:px-6 sm:text-[12px] lg:px-10">
        <p data-mast-side data-reveal className="min-w-0 truncate">
          <span className="font-semibold uppercase tracking-[0.08em] text-ink sm:tracking-[0.12em]">{SITE.location}</span>
          <span aria-hidden className="mx-2">·</span>
          <Dateline initial={dateline} />
        </p>
        <div data-mast-side data-reveal className="hidden shrink-0 items-center gap-5 md:flex">
          <Form action="/search" role="search" className="group flex items-center border-b border-ink/40 focus-within:border-navy">
            <label htmlFor="mast-search" className="sr-only">
              Search the paper
            </label>
            <input
              id="mast-search"
              name="q"
              type="search"
              placeholder="Search the paper"
              className="w-44 bg-transparent py-1 text-[13px] text-ink placeholder:text-ink-soft focus:outline-none lg:w-56"
            />
            <button
              type="submit"
              aria-label="Search"
              className="p-1 text-[15px] text-ink transition-colors hover:text-navy active:text-gold"
            >
              <SearchIcon />
            </button>
          </Form>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-navy active:text-gold"
          >
            <InstagramIcon className="text-[16px]" />
            <span>{SITE.instagramHandle}</span>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <span data-mast-rule aria-hidden className="block h-px bg-ink" />
        <div className="grid items-center gap-x-8 py-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:py-8 lg:py-10">
          <div data-mast-seal data-reveal className="hidden md:block">
            <Image src="/aisr-seal.png" alt="Seal of the American International School of Riyadh" width={96} height={96} className="size-20 lg:size-24" />
          </div>

          <Link href="/" className="group block text-center">
            <Title>
            <span
              data-nameplate
              data-reveal
              className="block font-serif text-[13.4vw] font-medium leading-[0.94] tracking-[-0.035em] text-ink md:whitespace-nowrap md:text-[clamp(3.25rem,6.1vw,6.1rem)]"
            >
              <span className="block md:inline">
                <em className="font-normal">The</em> AISR
              </span>{" "}
              <span className="block md:inline">Student Press</span>
            </span>
            </Title>
            <span data-mast-gold aria-hidden className="mx-auto mt-3 block h-[3px] w-24 bg-gold md:mt-4 md:w-40" />
          </Link>

          <p
            data-mast-side
            data-reveal
            className="mt-4 text-center font-serif text-[15px] italic leading-snug text-balance text-ink-soft md:mt-0 md:max-w-[16.5rem] md:justify-self-end md:text-right md:text-[16px]"
          >
            The student newspaper of the American International School of Riyadh
          </p>
        </div>
        <span data-mast-rule aria-hidden className="block h-[3px] bg-ink" />
        <span data-mast-rule aria-hidden className="mt-[3px] block h-px bg-ink" />
      </div>
    </header>
  );
}
