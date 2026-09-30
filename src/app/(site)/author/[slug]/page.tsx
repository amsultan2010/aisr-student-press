import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByStaff, getStaffMember } from "@/lib/data";
import { SITE } from "@/lib/site";
import { JsonLd, instagramUrl, pageMetadata, profilePageLd } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Avatar } from "@/components/ui/Avatar";
import { LinkButton } from "@/components/ui/Button";
import { PlaceholderTag } from "@/components/ui/PlaceholderTag";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageLabel } from "@/components/pages/PageLabel";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

const load = cache((slug: string) => getStaffMember(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = await load(slug);
  if (!person) return {};
  return pageMetadata({
    title: `${person.name}, ${person.role}`,
    description: person.bio
      ? person.bio.slice(0, 155)
      : `Stories by ${person.name}, ${person.role} at ${SITE.name}, the student newspaper of the American International School of Riyadh.`,
    path: `/author/${person.slug}`,
    type: "profile",
  });
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const person = await load(slug);
  if (!person) notFound();
  const stories = await getArticlesByStaff(person.id);
  const ig = instagramUrl(person.instagram);
  const first = person.name.split(/\s+/)[0];
  const handle = person.instagram?.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@?/, "@");

  return (
    <>
      <JsonLd data={profilePageLd(person)} />

      <header className="mx-auto max-w-page px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-20 lg:px-10">
        <div className="grid items-start gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
          <div data-rise>
            <Avatar name={person.name} photoUrl={person.photo_url} size={176} className="ring-4 ring-paper outline-1 outline-offset-4 outline-rule" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <PageLabel>{person.role}</PageLabel>
              {person.is_placeholder ? <PlaceholderTag /> : null}
            </div>
            <h1
              data-split="lines"
              className="mt-4 font-serif text-[clamp(3rem,7.5vw,6.75rem)] leading-[0.95] font-medium tracking-[-0.035em] text-balance"
            >
              {person.name}
            </h1>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-sans text-[13px] text-ink-soft">
              {person.grade ? (
                <div className="flex gap-2">
                  <dt className="font-semibold tracking-[0.08em] uppercase">Grade</dt>
                  <dd>{person.grade.replace(/^grade\s*/i, "")}</dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt className="font-semibold tracking-[0.08em] uppercase">Stories</dt>
                <dd className="tabular-nums">{stories.length}</dd>
              </div>
            </dl>
            <p data-rise className="mt-7 max-w-[60ch] font-serif text-xl leading-[1.55] text-ink/85">
              {person.bio || `${first} is on the staff of ${SITE.name}. A longer bio is on the way.`}
            </p>
            {ig ? (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2.5 font-sans text-[13px] font-semibold text-navy transition-colors hover:text-ink active:text-navy-deep"
              >
                <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                <span className="underline decoration-rule underline-offset-4 group-hover:decoration-current">{handle}</span>
                <span className="sr-only"> on Instagram</span>
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section aria-labelledby="stories-h" className="border-t border-rule bg-paper-2/50">
        <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24 lg:px-10">
          <SectionHeading id="stories-h" title={`All stories by ${person.name}`} />
          {stories.length ? (
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((a) => (
                <ArticleCard key={a.id} article={a} variant="standard" dek />
              ))}
            </div>
          ) : (
            <div className="mt-10 max-w-[56ch]">
              <p className="font-serif text-2xl leading-snug tracking-[-0.01em]">No stories yet.</p>
              <p className="mt-3 font-serif text-lg leading-relaxed text-ink-soft">
                {first}&apos;s first byline is on the way. In the meantime, the rest of the staff is on the About page.
              </p>
              <LinkButton href="/about#team" variant="outline" className="mt-8" arrow>
                Meet the staff
              </LinkButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
