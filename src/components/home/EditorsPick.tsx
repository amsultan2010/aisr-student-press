"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { ArticleCard as Card } from "@/lib/data";
import { Byline } from "@/components/ui/Byline";
import { LinkButton } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { PlaceholderTag } from "@/components/ui/PlaceholderTag";
import { gsap, ScrollTrigger, SplitText, D, E, MQ, useGSAP } from "@/lib/motion";

// Article of the Month: the homepage's one pinned set piece. On desktop the
// section pins while the photo opens from an inset frame to full bleed, the
// outlined label slides past, and the headline rises word by word. Mobile
// gets one-shot reveals; reduced motion gets the finished frame.
export function EditorsPick({ article }: { article: Card }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current!;
      const stage = root.querySelector<HTMLElement>("[data-pick-stage]")!;
      const heading = root.querySelector<HTMLElement>("[data-pick-heading]")!;
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const split = SplitText.create(heading, { type: "words", mask: "words" });
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.fromTo("[data-pick-media]", { clipPath: "inset(16% 31% 20% 31%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: E.inOut }, 0)
          .fromTo("[data-pick-img]", { scale: 1.3 }, { scale: 1, duration: 1.2, ease: E.out }, 0)
          .fromTo("[data-pick-outline]", { xPercent: 8 }, { xPercent: -42, duration: 1.6 }, 0)
          .fromTo("[data-pick-scrim]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.45)
          .from(split.words, { yPercent: 115, duration: 0.5, stagger: 0.035, ease: E.out }, 0.7)
          .from("[data-pick-fade]", { autoAlpha: 0, y: 24, duration: 0.35, stagger: 0.08, ease: E.out }, 0.95)
          .to({}, { duration: 0.25 });
        // Attach after the timeline is built so the pin measures itself right
        // away (a scrollTrigger in the timeline vars waits a tick to initialise).
        ScrollTrigger.create({
          animation: tl,
          trigger: stage,
          start: "top top",
          end: () => `+=${Math.round(innerHeight * 1.4)}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        });
        return () => split.revert();
      });

      mm.add(MQ.mobile, () => {
        const split = SplitText.create(heading, { type: "words", mask: "words" });
        const st = { trigger: stage, start: "top 70%", once: true };
        gsap.fromTo("[data-pick-media]", { clipPath: "inset(10% 10% 10% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: D.slow, ease: E.inOut, scrollTrigger: st });
        gsap.from("[data-pick-img]", { scale: 1.2, duration: D.epic, scrollTrigger: st });
        gsap.from(split.words, { yPercent: 115, duration: D.base, stagger: 0.03, scrollTrigger: { trigger: heading, start: "top 90%", once: true } });
        gsap.from("[data-pick-fade]", { autoAlpha: 0, y: 16, duration: D.base, stagger: 0.08, scrollTrigger: { trigger: heading, start: "top 90%", once: true } });
        return () => split.revert();
      });

      // Pointer depth: the photo drifts toward the cursor.
      mm.add(`${MQ.pointer} and (min-width: 900px)`, () => {
        const img = root.querySelector("[data-pick-img]")!;
        const xTo = gsap.quickTo(img, "x", { duration: 1, ease: "power3" });
        const yTo = gsap.quickTo(img, "y", { duration: 1, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          xTo(((e.clientX - r.left) / r.width - 0.5) * 28);
          yTo(((e.clientY - r.top) / r.height - 0.5) * 20);
        };
        stage.addEventListener("pointermove", move);
        return () => stage.removeEventListener("pointermove", move);
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-labelledby="pick-h" className="relative mt-28 bg-navy-deep text-paper md:mt-40">
      <div data-pick-stage className="relative flex min-h-[100svh] items-end overflow-hidden">
        <p
          aria-hidden
          data-pick-outline
          className="pointer-events-none absolute top-[9%] left-0 whitespace-nowrap font-serif text-[19vw] leading-none italic text-transparent opacity-45 [-webkit-text-stroke:1px_var(--color-gold-soft)]"
        >
          Article of the Month
        </p>

        <div data-pick-media className="absolute inset-0 overflow-hidden">
          <div data-pick-img className="absolute -inset-[3%]">
            {article.cover_url && (
              <Image src={article.cover_url} alt={article.cover_alt} fill sizes="100vw" className="object-cover" />
            )}
          </div>
          {/* Functional scrim so the headline passes contrast over any photo. */}
          <div
            data-pick-scrim
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-navy-deep)_8%,color-mix(in_srgb,var(--color-navy-deep)_70%,transparent)_48%,color-mix(in_srgb,var(--color-navy-deep)_20%,transparent)_100%)]"
          />
        </div>

        <div className="relative mx-auto w-full max-w-page px-4 pt-40 pb-14 sm:px-6 md:pb-20 lg:px-10">
          <div className="max-w-[64rem]">
            <p data-pick-fade className="flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              <span aria-hidden className="h-px w-10 bg-gold" />
              Editor&apos;s pick: Article of the Month
            </p>
            <div data-pick-fade className="mt-5 flex flex-wrap items-center gap-3">
              <Kicker section={article.section} tone="gold" />
              {article.is_placeholder && <PlaceholderTag tone="paper" />}
            </div>
            <h2
              id="pick-h"
              className="mt-4 font-serif text-[clamp(2.6rem,6.2vw,6.25rem)] font-medium leading-[0.96] tracking-[-0.036em] text-balance"
            >
              <Link
                href={article.href}
                className="underline decoration-transparent decoration-[0.05em] underline-offset-[0.12em] transition-[text-decoration-color] duration-300 hover:decoration-gold-soft"
              >
                <span data-pick-heading className="block">
                  {article.title}
                </span>
              </Link>
            </h2>
            <p data-pick-fade className="mt-6 max-w-[56ch] text-[1.2rem] leading-[1.5] text-paper/85 md:text-[1.35rem]">
              {article.dek}
            </p>
            <div data-pick-fade className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-6">
              <Byline authors={article.authors} date={article.published_at} minutes={article.reading_minutes} tone="paper" avatar size="md" />
              <LinkButton href={article.href} variant="gold" size="lg" magnetic arrow>
                Read the story
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
