"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mark } from "@/components/ui/Mark";
import { cx } from "@/components/ui/cx";
import { NAV, SECTIONS, SITE } from "@/lib/site";
import { gsap, ScrollTrigger, D, E, MQ, useGSAP } from "@/lib/motion";
import { CloseIcon, InstagramIcon, MenuIcon, SearchIcon } from "./icons";
import { BuiltByLink } from "./BuiltBy";
import { lockScroll } from "./SiteMotion";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Sticky section nav. Once it sticks, a compact nameplate slides in on the
// left and a search button on the right (toggled GSAP timeline). Below 900px
// the links move into a full-screen navy menu (a modal <dialog>: focus is
// trapped and Esc closes it).
export function NavBar() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const root = ref.current!;
      const mm = gsap.matchMedia();
      const build = (animated: boolean) => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: E.inOut, duration: animated ? D.base : 0 } });
        tl.fromTo("[data-compact]", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0 })
          .fromTo("[data-compact-search]", { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0 }, 0)
          .fromTo("[data-stuck-rule]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center" }, 0);
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
        if (st.scroll() > st.start) tl.progress(1);
        return () => st.kill();
      };
      mm.add("(prefers-reduced-motion: no-preference)", () => build(true));
      mm.add(MQ.reduced, () => build(false));
      return () => mm.revert();
    },
    { scope: ref },
  );

  // Menu open/close choreography (event handlers, so tweens live outside
  // the render-time GSAP context; the timeline is killed on unmount).
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => () => void menuTl.current?.kill(), []);

  function openMenu() {
    const dialog = dialogRef.current!;
    dialog.showModal();
    lockScroll(true);
    setOpen(true);
    if (matchMedia(MQ.reduced).matches) return;
    menuTl.current?.kill();
    menuTl.current = gsap
      .timeline({ defaults: { ease: E.out } })
      .fromTo(dialog, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: D.base, ease: E.inOut })
      .from(dialog.querySelectorAll("[data-menu-link]"), { yPercent: 110, duration: D.slow, stagger: 0.05 }, 0.2)
      .from(dialog.querySelectorAll("[data-menu-fade]"), { autoAlpha: 0, y: 12, duration: D.base, stagger: 0.06 }, 0.45);
  }

  function closeMenu() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    const done = () => {
      dialog.close();
      gsap.set(dialog, { clearProps: "clipPath" });
    };
    menuTl.current?.kill();
    if (matchMedia(MQ.reduced).matches) return done();
    menuTl.current = gsap
      .timeline({ onComplete: done })
      .to(dialog, { clipPath: "inset(0% 0% 100% 0%)", duration: D.base, ease: E.inOut });
  }

  // Safety net: close the menu if the route changes while it is open.
  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  return (
    <>
      <nav ref={ref} aria-label="Main" className="sticky top-0 z-40 bg-paper">
        <div className="relative mx-auto flex h-13 max-w-page items-center px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            data-compact
            className="invisible absolute left-4 flex items-center gap-2.5 py-1 sm:left-6 lg:left-10"
            tabIndex={-1}
            aria-hidden
          >
            <Mark variant="tile" className="w-8" />
            <span className="font-serif text-[1.15rem] font-medium tracking-[-0.02em] text-ink max-[1439px]:min-[900px]:hidden">
              <em className="font-normal max-sm:hidden">The </em>
              <span className="max-sm:hidden">AISR </span>Student Press
            </span>
          </Link>

          <ul className="mx-auto hidden items-center gap-x-6 min-[900px]:flex xl:gap-x-8">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative block py-4 font-sans text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
                      "after:absolute after:inset-x-0 after:bottom-2.5 after:h-[2px] after:origin-left after:transition-transform after:duration-300 after:ease-press",
                      "hover:text-navy active:text-navy-deep",
                      active ? "text-navy after:scale-x-100 after:bg-gold" : "text-ink after:scale-x-0 after:bg-navy hover:after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/search"
            data-compact-search
            className="invisible absolute right-4 hidden items-center gap-2 p-2 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:text-navy active:text-gold min-[900px]:flex sm:right-6 lg:right-10"
          >
            <SearchIcon className="text-[16px]" />
            <span className="sr-only xl:not-sr-only">Search</span>
          </Link>

          <div className="ml-auto flex items-center gap-1 min-[900px]:hidden">
            <Link href="/search" aria-label="Search" className="p-3 text-[18px] text-ink transition-colors hover:text-navy active:text-gold">
              <SearchIcon />
            </Link>
            <button
              type="button"
              onClick={openMenu}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="flex items-center gap-2.5 bg-navy px-4 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-navy-deep active:bg-ink"
            >
              <MenuIcon className="text-[18px]" />
              Menu
            </button>
          </div>
        </div>
        <span aria-hidden className="block h-px bg-ink" />
        <span data-stuck-rule aria-hidden className="block h-[2px] scale-x-0 bg-gold" />
      </nav>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        data-lenis-prevent
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          lockScroll(false);
          setOpen(false);
        }}
        onClick={(e) => {
          // Following a link: wipe the menu away while the page transition runs.
          if ((e.target as Element).closest("a[href]:not([target])")) closeMenu();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-navy-deep p-0 text-paper backdrop:bg-transparent"
      >
        <div className="flex min-h-full flex-col px-5 pt-4 pb-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 py-1">
              <Mark variant="plain" tone="paper" className="w-9" />
              <span className="font-serif text-lg">
                <em>The</em> AISR Student Press
              </span>
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex size-11 items-center justify-center rounded-full border border-paper/30 text-[18px] transition-colors hover:border-paper hover:bg-paper hover:text-navy-deep active:bg-gold-soft"
            >
              <CloseIcon />
            </button>
          </div>

          <p data-menu-fade className="mt-10 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            Sections
          </p>
          <ul className="mt-3 border-t border-paper/15">
            {SECTIONS.map((s) => (
              <li key={s.slug} className="overflow-hidden border-b border-paper/15">
                <Link
                  data-menu-link
                  href={`/${s.slug}`}
                  aria-current={isActive(pathname, `/${s.slug}`) ? "page" : undefined}
                  className="block py-3 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.02em] transition-colors hover:text-gold-soft active:text-gold aria-[current=page]:text-gold-soft"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>

          <ul data-menu-fade className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-sans text-[13px] font-semibold uppercase tracking-[0.12em]">
            <li>
              <Link href="/about" className="underline decoration-paper/30 underline-offset-4 hover:decoration-gold-soft">
                About & Team
              </Link>
            </li>
            <li>
              <Link href="/submit" className="underline decoration-paper/30 underline-offset-4 hover:decoration-gold-soft">
                Submit a Pitch
              </Link>
            </li>
            <li>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 underline decoration-paper/30 underline-offset-4 hover:decoration-gold-soft"
              >
                <InstagramIcon className="text-[15px]" /> Instagram
              </a>
            </li>
          </ul>

          <Form data-menu-fade action="/search" role="search" className="mt-auto flex items-center border-b border-paper/40 pt-10 focus-within:border-gold">
            <label htmlFor="menu-search" className="sr-only">
              Search the paper
            </label>
            <input
              id="menu-search"
              name="q"
              type="search"
              placeholder="Search the paper"
              className="min-w-0 flex-1 bg-transparent py-3 font-serif text-xl text-paper placeholder:text-paper/55 focus:outline-none"
            />
            <button type="submit" aria-label="Search" className="p-3 text-[20px] transition-colors hover:text-gold-soft active:text-gold">
              <SearchIcon />
            </button>
          </Form>
          <BuiltByLink data-menu-fade tone="paper" className="mt-6 self-start" />
        </div>
      </dialog>
    </>
  );
}
