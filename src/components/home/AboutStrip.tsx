import Link from "next/link";
import type { StaffMember } from "@/lib/data";
import { SITE, SECTIONS } from "@/lib/site";
import { Avatar, LinkButton, Mark } from "@/components/ui";
import { InstagramIcon } from "@/components/site/icons";

const RING = "The AISR Student Press · Riyadh · Student journalism · ";

// What the club is, who runs it, and how to get involved. The numbers are
// live counts from the database.
export function AboutStrip({ editors, storyCount }: { editors: StaffMember[]; storyCount: number }) {
  const stats = [
    { label: storyCount === 1 ? "Story published" : "Stories published", value: storyCount },
    { label: "Sections", value: SECTIONS.length },
    { label: editors.length === 1 ? "Editor-in-Chief" : "Co-Editors-in-Chief", value: editors.length },
  ].filter((s) => s.value > 0);

  return (
    <section aria-labelledby="about-h" className="mx-auto max-w-page px-4 pt-28 sm:px-6 md:pt-44 lg:px-10">
      <span data-rule aria-hidden className="block h-[3px] bg-ink" />
      <span data-rule aria-hidden className="mt-[3px] block h-px bg-ink" />
      <div className="grid gap-16 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-navy">About the Student Press</p>
          <h2 id="about-h" className="mt-5 font-serif text-[clamp(2.4rem,4.8vw,4.6rem)] font-medium leading-[1] tracking-[-0.032em] text-balance">
            <span data-split="lines" className="block">
              A newspaper written by students, for everyone at AISR.
            </span>
          </h2>
          <p data-rise className="mt-7 max-w-[58ch] text-[1.2rem] leading-[1.6] text-ink-soft">
            We report on what happens at school, cover games and events, argue in the opinion pages and publish poems,
            stories and art. Any student at AISR can pitch an idea or send in finished work, whether or not they are on the
            staff.
          </p>
          <div data-rise className="mt-9 flex flex-wrap gap-4">
            <LinkButton href="/submit" size="lg" magnetic arrow>
              Submit a pitch
            </LinkButton>
            <LinkButton href={SITE.instagram} external variant="outline" size="lg" magnetic>
              <InstagramIcon className="text-[16px]" />
              Follow on Instagram
            </LinkButton>
          </div>

          <dl className="mt-16 grid grid-cols-3 border-t border-rule">
            {stats.map((s, i) => (
              <div key={s.label} className={`flex flex-col ${i > 0 ? "border-l border-rule pt-6 pl-5 md:pl-8" : "pt-6"}`}>
                <dt className="font-sans text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-ink-soft">{s.label}</dt>
                <dd data-count className="order-first mt-2 font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-none tracking-[-0.03em] text-navy">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:pl-10">
          <div className="relative mx-auto size-60 md:size-72 lg:mx-0 lg:ml-auto">
            <svg data-spin="48" aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full text-ink">
              <defs>
                <path id="ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
              </defs>
              <text className="font-sans" fontSize="11.5" fontWeight="600" letterSpacing="3.2" fill="currentColor">
                <textPath href="#ring" textLength="524" lengthAdjust="spacing">
                  {RING.toUpperCase()}
                </textPath>
              </text>
            </svg>
            <Mark variant="tile" className="absolute inset-[29%]" />
          </div>

          {editors.length > 0 && (
            <div className="mt-12">
              <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Run by</h3>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {editors.map((p) => (
                  <li key={p.id}>
                    <Link href={`/author/${p.slug}`} className="group flex items-center gap-5 py-5 transition-colors hover:bg-paper-2 active:bg-rule/40">
                      <Avatar name={p.name} photoUrl={p.photo_url} size={64} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[1.6rem] leading-tight tracking-[-0.015em] underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-navy">
                          {p.name}
                        </span>
                        <span className="mt-1 block font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{p.role}</span>
                      </span>
                      <svg aria-hidden viewBox="0 0 20 10" className="mr-2 h-2.5 w-5 text-navy transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M0 5h18M14 1l4 4-4 4" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
