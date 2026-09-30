import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Mark } from "@/components/ui/Mark";
import { SECTIONS, SITE } from "@/lib/site";
import { InstagramIcon } from "./icons";

const linkClass =
  "inline-block py-1 text-paper/85 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-paper hover:decoration-gold-soft active:text-gold-soft";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">{title}</h2>
      <ul className="mt-4 space-y-1.5 font-sans text-[14px]">{children}</ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-28 overflow-hidden bg-navy-deep text-paper md:mt-40">
      <div className="mx-auto max-w-page px-4 pt-16 sm:px-6 md:pt-24 lg:px-10">
        <div className="flex items-start justify-between gap-6">
          <p data-split="chars" className="font-serif text-[15.5vw] font-medium leading-[1.02] tracking-[-0.04em] md:text-[clamp(5rem,10.5vw,10.5rem)]">
            <em className="font-normal">The</em> AISR
            <br />
            Student Press
          </p>
          <Image
            src="/aisr-seal.png"
            alt=""
            width={120}
            height={120}
            className="hidden size-24 shrink-0 opacity-90 md:block lg:size-28"
          />
        </div>
        <span data-rule aria-hidden className="mt-10 block h-[3px] bg-gold md:mt-14" />

        <div className="grid gap-12 py-14 md:grid-cols-12 md:gap-8 md:py-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <Mark variant="plain" tone="paper" className="w-12" />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                Student journalism
                <br />
                from Riyadh
              </p>
            </div>
            <p className="mt-6 max-w-[40ch] text-[1.08rem] leading-[1.6] text-paper/85">
              The AISR Student Press is the student newspaper club at the American International School of Riyadh. Students
              report, write, edit and photograph every story on this site.
            </p>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="mt-7 inline-flex items-center gap-2.5 border border-paper/40 px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-paper hover:bg-paper hover:text-navy-deep active:bg-gold-soft"
            >
              <InstagramIcon className="text-[16px]" />
              {SITE.instagramHandle}
            </a>
          </div>

          <div className="md:col-span-3">
            <Column title="Sections">
              {SECTIONS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className={linkClass}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </Column>
          </div>

          <div className="md:col-span-2">
            <Column title="The paper">
              <li>
                <Link href="/about" className={linkClass}>
                  About us
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  Our team
                </Link>
              </li>
              <li>
                <Link href="/submit" className={linkClass}>
                  Submit a pitch
                </Link>
              </li>
              <li>
                <Link href="/search" className={linkClass}>
                  Search
                </Link>
              </li>
            </Column>
          </div>

          <div className="md:col-span-2">
            <Column title="Contact">
              <li>
                <Link href="/submit" className={linkClass}>
                  Write to the editors
                </Link>
              </li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Instagram
                </a>
              </li>
            </Column>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 font-sans text-[12.5px] text-paper/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. {SITE.location}.
          </p>
          <p>Opinions in the Opinion section are the writers&apos; own.</p>
        </div>
      </div>

      <a
        href={SITE.builtBy.url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Visit"
        className="group block bg-gold text-navy-deep transition-colors duration-300 hover:bg-gold-soft active:bg-paper"
      >
        <span className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-5 sm:px-6 lg:px-10">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em]">Website designed and built by</span>
          <span className="flex items-center gap-3">
            <span className="font-serif text-[1.5rem] italic leading-none tracking-[-0.01em] md:text-[1.75rem]">
              {SITE.builtBy.name}
            </span>
            <span className="hidden font-sans text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline">
              amsultan.site
            </span>
            <Arrow className="text-[1.1rem]" />
          </span>
        </span>
      </a>
    </footer>
  );
}
