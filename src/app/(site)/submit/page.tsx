import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { PageLabel } from "@/components/pages/PageLabel";
import { SubmitForm, type SubmissionKind } from "@/components/pages/SubmitForm";

export const metadata: Metadata = pageMetadata({
  title: "Submit a Pitch or Contact Us",
  description:
    "Pitch a story, send an article, write a letter to the editor, submit photos or art, or get in touch with the editors of The AISR Student Press.",
  path: "/submit",
});

const KINDS: SubmissionKind[] = ["pitch", "article", "letter", "photo", "contact"];

const NEXT_STEPS = [
  {
    title: "An editor reads it",
    body: "Every submission goes to the editors. Pitches are passed to the editor of the section they fit best.",
  },
  {
    title: "We reply by email",
    body: "If we want to run it or work on it with you, we will email you to talk it through. Pitches can turn into your first assignment.",
  },
  {
    title: "We edit it together",
    body: "Articles, letters and photos are edited for accuracy, length and clarity before they run, and the final version goes up with your name on it.",
  },
];

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  const { kind } = await searchParams;
  const initialKind = KINDS.find((k) => k === kind) ?? "pitch";

  return (
    <>
      <div className="mx-auto max-w-page px-4 pt-12 pb-24 sm:px-6 md:pt-20 md:pb-32 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <header className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <PageLabel>Submit a Pitch</PageLabel>
              <h1
                data-split="lines"
                className="mt-5 font-serif text-[clamp(2.75rem,6.4vw,5.75rem)] leading-[0.95] font-medium tracking-[-0.035em] text-balance"
              >
                Got a story? We want to hear it.
              </h1>
              <p data-rise className="mt-7 max-w-[46ch] font-serif text-xl leading-relaxed text-ink-soft">
                You do not have to be on staff to write for the Press. Send us an idea, a finished piece, a letter, or your
                photos and art. You can also use this form to ask a question or report a mistake.
              </p>

              <div data-rule className="mt-12 h-px bg-ink" />
              <h2 className="mt-6 font-sans text-xs font-semibold tracking-[0.14em] text-navy uppercase">What happens next</h2>
              <ol className="mt-2">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step.title} data-card className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-rule py-5">
                    <span className="font-serif text-2xl leading-none text-gold italic">{i + 1}</span>
                    <div>
                      <h3 className="font-serif text-xl leading-tight">{step.title}</h3>
                      <p className="mt-1.5 font-serif text-base leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 font-sans text-sm leading-relaxed text-ink-soft">
                Prefer to message? Find us on Instagram at{" "}
                <a
                  href={SITE.instagram}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-navy active:text-navy-deep"
                >
                  {SITE.instagramHandle}
                </a>
                .
              </p>
            </div>
          </header>

          <section aria-label="Submission form" className="lg:col-span-7 lg:border-l lg:border-rule lg:pl-12">
            <SubmitForm initialKind={initialKind} />
          </section>
        </div>
      </div>
    </>
  );
}
