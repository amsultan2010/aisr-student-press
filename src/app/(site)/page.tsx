import type { Metadata } from "next";
import { AboutStrip } from "@/components/home/AboutStrip";
import { CreativeGallery } from "@/components/home/CreativeGallery";
import { EditorsPick } from "@/components/home/EditorsPick";
import { LatestFeed } from "@/components/home/LatestFeed";
import { LifeSports } from "@/components/home/LifeSports";
import { NewsBlock } from "@/components/home/NewsBlock";
import { OpinionBand } from "@/components/home/OpinionBand";
import { TopStory } from "@/components/home/TopStory";
import { LinkButton } from "@/components/ui";
import { getArticleCounts, getEditorsPick, getLatest, getLead, getSectionArticles, getStaff } from "@/lib/data";
import { OrganizationJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} | Student news from AISR`,
  absoluteTitle: true,
  description: `${SITE.tagline}. Campus news, student life, sports, opinion and creative work, written by students.`,
  path: "/",
});

export default async function Home() {
  const [lead, pick, counts, staff, news, life, sports, opinion, creative] = await Promise.all([
    getLead(),
    getEditorsPick(),
    getArticleCounts(),
    getStaff(),
    getSectionArticles("news", 5),
    getSectionArticles("student-life", 4),
    getSectionArticles("sports", 4),
    getSectionArticles("opinion", 5),
    getSectionArticles("creative-corner", 4),
  ]);
  const latest = await getLatest(12, lead ? [lead.id] : []);
  const editors = staff.filter((s) => s.role_group === "leadership");
  // Stories already featured higher up are not repeated in their section band.
  const newsBand = news.filter((a) => a.id !== lead?.id).slice(0, 4);
  const opinionRest = opinion.filter((a) => a.id !== pick?.id);
  const opinionBand = (opinionRest.length >= 3 ? opinionRest : opinion).slice(0, 4);

  if (!lead) {
    return (
      <div className="mx-auto max-w-page px-4 py-24 sm:px-6 lg:px-10">
        <OrganizationJsonLd />
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-navy">First edition</p>
        <h2 className="mt-4 max-w-[18ch] font-serif text-5xl leading-none tracking-[-0.03em]">The first stories are on their way.</h2>
        <p className="mt-6 max-w-[52ch] text-lg text-ink-soft">Have an idea for one? Pitch it to the editors.</p>
        <LinkButton href="/submit" className="mt-8" arrow>
          Submit a pitch
        </LinkButton>
      </div>
    );
  }

  return (
    <>
      <OrganizationJsonLd />
      <TopStory lead={lead} rail={latest.slice(0, 5)} />
      <LatestFeed items={latest.slice(5, 12)} />
      <NewsBlock items={newsBand} name="School News" count={counts.bySection.news ?? news.length} />
      <OpinionBand items={opinionBand} />
      {pick && <EditorsPick article={pick} />}
      <CreativeGallery items={creative} />
      <LifeSports life={life} sports={sports} />
      <AboutStrip editors={editors} storyCount={counts.total} />
    </>
  );
}
