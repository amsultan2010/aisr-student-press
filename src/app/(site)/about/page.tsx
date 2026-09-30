import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSections, getStaff, type StaffMember } from "@/lib/data";
import { SITE } from "@/lib/site";
import { OrganizationJsonLd, pageMetadata } from "@/lib/seo";
import { LinkButton } from "@/components/ui/Button";
import { PageLabel } from "@/components/pages/PageLabel";
import { StaffCard } from "@/components/pages/StaffCard";
import { EthicsPolicy } from "@/components/pages/EthicsPolicy";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "About Us and Our Team",
  description:
    "Who runs The AISR Student Press, what we cover, how to join the staff, and the editorial policy every story on the site follows.",
  path: "/about",
});

const GROUPS: { key: string; label: string }[] = [
  { key: "leadership", label: "Editors-in-Chief" },
  { key: "editors", label: "Editors" },
  { key: "writers", label: "Writers" },
  { key: "photographers", label: "Photographers" },
  { key: "contributors", label: "Contributors" },
];

const CONTENTS = [
  { href: "#mission", label: "Our mission" },
  { href: "#cover", label: "What we cover" },
  { href: "#join", label: "Join the staff" },
  { href: "#team", label: "Our team" },
  { href: "#ethics", label: "Editorial policy" },
];

export default async function AboutPage() {
  const [sections, staff] = await Promise.all([getSections(), getStaff()]);
  const groups = GROUPS.map((g) => ({ ...g, people: staff.filter((p) => p.role_group === g.key) })).filter(
    (g) => g.people.length > 0,
  );

  return (
    <>
      <OrganizationJsonLd />

      <header className="mx-auto max-w-page px-4 pt-12 pb-14 sm:px-6 md:pt-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <PageLabel>About Us</PageLabel>
            <h1
              data-split="lines"
              className="mt-5 font-serif text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.035em] text-balance"
            >
              Students reporting on the school they know best.
            </h1>
            <p data-rise className="mt-8 max-w-[62ch] font-serif text-xl leading-relaxed text-ink-soft md:text-[1.375rem]">
              {SITE.name} is the student newspaper club at the {SITE.school}. We cover campus news, student life,
              sports, opinion and creative work, and every story on this site is reported, photographed and edited by
              students.
            </p>
          </div>
          <aside className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10" aria-label="On this page">
            <Image src="/aisr-seal.png" alt="The seal of the American International School of Riyadh" width={96} height={96} className="size-20 md:size-24" />
            <p className="mt-6 font-sans text-[11px] font-semibold tracking-[0.14em] text-ink-soft uppercase">On this page</p>
            <ol className="mt-3 border-t border-ink">
              {CONTENTS.map((c, i) => (
                <li key={c.href} className="border-b border-rule">
                  <a
                    href={c.href}
                    className="group flex items-baseline gap-4 py-2.5 font-serif text-lg transition-colors hover:text-navy active:text-navy-deep"
                  >
                    <span className="font-sans text-xs tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-current">
                      {c.label}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <div data-rule className="h-[3px] bg-ink" />
        <div className="mt-[3px] h-px bg-ink" />
      </div>

      <section id="mission" aria-labelledby="mission-h" className="mx-auto max-w-page scroll-mt-28 px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 id="mission-h" className="font-sans text-xs font-semibold tracking-[0.14em] text-navy uppercase lg:col-span-3">
            Our mission
          </h2>
          <div className="lg:col-span-9">
            <p data-rise className="max-w-[34ch] font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.15] tracking-[-0.015em]">
              Tell the AISR community what is happening at school, accurately and fairly, and give students a place to be
              heard.
            </p>
            <div className="mt-10 grid max-w-[72ch] gap-6 font-serif text-lg leading-[1.65] md:grid-cols-2 md:gap-10">
              <p>
                We ask questions, check the answers, and publish work we are willing to put our names on. A good school
                paper is a record of the year: the games, the elections, the new teachers, the arguments in the
                cafeteria and the art that came out of them.
              </p>
              <p>
                The Press is run by students. Editors assign and edit stories, writers and photographers report them, and
                anyone at AISR can pitch an idea or send in their work through the{" "}
                <Link href="/submit" className="underline decoration-gold decoration-2 underline-offset-4 hover:text-navy">
                  submission form
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cover" aria-labelledby="cover-h" className="scroll-mt-28 border-t border-rule bg-paper-2/60">
        <div className="mx-auto max-w-page px-4 py-20 sm:px-6 md:py-24 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-3">
              <h2 id="cover-h" className="font-sans text-xs font-semibold tracking-[0.14em] text-navy uppercase">
                What we cover
              </h2>
              <p className="mt-4 max-w-[30ch] font-serif text-base leading-relaxed text-ink-soft">
                Five sections, each with its own editor. Every story on the site belongs to one of them.
              </p>
            </div>
            <ol className="border-t border-ink lg:col-span-9">
              {sections.map((s, i) => (
                <li key={s.slug} data-card className="border-b border-rule">
                  <Link
                    href={`/${s.slug}`}
                    className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-1 py-6 transition-colors hover:bg-paper/70 active:bg-paper md:grid-cols-[3.5rem_minmax(0,22rem)_1fr_auto] md:gap-x-8 md:px-3"
                  >
                    <span className="font-serif text-lg text-gold tabular-nums italic">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-2xl leading-tight tracking-[-0.015em] group-hover:text-navy md:text-3xl">
                      {s.name}
                    </span>
                    <span className="col-start-2 font-serif text-base leading-relaxed text-ink-soft md:col-start-auto">
                      {s.description}
                    </span>
                    <span
                      aria-hidden
                      className="hidden font-sans text-lg text-navy transition-transform duration-300 ease-press group-hover:translate-x-1.5 md:inline"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="join" aria-labelledby="join-h" className="scroll-mt-28 bg-navy-deep text-paper">
        <div className="mx-auto grid max-w-page gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-6">
            <p className="font-sans text-xs font-semibold tracking-[0.14em] text-gold-soft uppercase">Join the staff</p>
            <h2
              id="join-h"
              data-split="lines"
              className="mt-5 font-serif text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.03em]"
            >
              No experience needed. Curiosity helps.
            </h2>
            <p className="mt-8 max-w-[52ch] font-serif text-lg leading-[1.65] text-paper/80">
              The Press is open to any AISR student who wants to write, report, take photos, draw or edit. New members
              start with a small assignment and get feedback from an editor before anything is published.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <LinkButton href="/submit" variant="gold" size="lg" arrow magnetic>
                Send us a pitch
              </LinkButton>
              <LinkButton href={SITE.instagram} external variant="paper" size="lg">
                Message us on Instagram
              </LinkButton>
            </div>
          </div>
          <ol className="grid content-start gap-px border-t border-paper/30 lg:col-span-5 lg:col-start-8">
            {[
              {
                title: "Say hello",
                body: `Talk to one of the Editors-in-Chief at school, or send a message to ${SITE.instagramHandle} on Instagram.`,
              },
              {
                title: "Pick a first story",
                body: "Choose a section you like. Your editor will help you shape an idea into something you can report in a week or two.",
              },
              {
                title: "Report, write, revise",
                body: "Interview people, take notes, write a draft, and work through edits. Your byline goes on the story when it runs.",
              },
            ].map((step, i) => (
              <li key={step.title} data-card className="grid grid-cols-[3rem_1fr] gap-4 border-b border-paper/20 py-7">
                <span className="font-serif text-4xl leading-none text-gold-soft italic">{i + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl leading-tight">{step.title}</h3>
                  <p className="mt-2 font-serif text-base leading-relaxed text-paper/75">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="team" aria-labelledby="team-h" className="mx-auto max-w-page scroll-mt-28 px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <PageLabel>Our team</PageLabel>
            <h2
              id="team-h"
              data-split="lines"
              className="mt-4 font-serif text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.03em]"
            >
              The staff
            </h2>
          </div>
          <p className="max-w-[44ch] font-serif text-base leading-relaxed text-ink-soft">
            Click a name to read everything that person has written or photographed for the Press.
          </p>
        </div>
        <div data-rule className="mt-10 h-px bg-ink" />

        {groups.length === 0 ? (
          <p className="mt-10 font-serif text-lg text-ink-soft">The staff list is being put together. Check back soon.</p>
        ) : (
          groups.map((g) => <StaffGroup key={g.key} label={g.label} people={g.people} lead={g.key === "leadership"} />)
        )}
      </section>

      <EthicsPolicy />
    </>
  );
}

function StaffGroup({ label, people, lead }: { label: string; people: StaffMember[]; lead: boolean }) {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-12">
      <h3 className="font-sans text-xs font-semibold tracking-[0.14em] text-navy uppercase lg:col-span-3 lg:pt-6">{label}</h3>
      <ul className={lead ? "grid gap-x-10 sm:grid-cols-2 lg:col-span-9" : "grid gap-x-10 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3"}>
        {people.map((p) => (
          <li key={p.id} data-card className="border-t border-rule">
            <StaffCard person={p} size={lead ? "lg" : "sm"} />
          </li>
        ))}
      </ul>
    </div>
  );
}
