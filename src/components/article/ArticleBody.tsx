import { renderArticleBody } from "@/lib/editor/render";
import { cx } from "@/components/ui/cx";
import { BodyMotion } from "./BodyMotion";

// Long-form typography for the Tiptap schema: paragraphs, h2/h3 subheads,
// lists, links, rules, block images and blockquotes (styled as pull quotes).
const PROSE = cx(
  "font-serif text-[1.1875rem] leading-[1.7] text-ink md:text-[1.25rem] [overflow-wrap:break-word]",
  "[&>*+*]:mt-[1.15em]",
  // Drop cap on the opening paragraph.
  "[&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mt-[0.06em] [&>p:first-child]:first-letter:mr-3",
  "[&>p:first-child]:first-letter:font-serif [&>p:first-child]:first-letter:text-[4.4em] [&>p:first-child]:first-letter:leading-[0.8]",
  "[&>p:first-child]:first-letter:font-medium [&>p:first-child]:first-letter:text-navy",
  // Subheads.
  "[&>h2]:mt-[2.1em] [&>h2]:font-serif [&>h2]:text-[1.75rem] [&>h2]:leading-[1.15] [&>h2]:font-medium [&>h2]:tracking-[-0.02em] md:[&>h2]:text-[2rem]",
  "[&>h2]:before:mb-4 [&>h2]:before:block [&>h2]:before:h-[2px] [&>h2]:before:w-10 [&>h2]:before:bg-gold [&>h2]:before:content-['']",
  "[&>h3]:mt-[2em] [&>h3]:font-sans [&>h3]:text-[0.9rem] [&>h3]:font-semibold [&>h3]:tracking-[0.1em] [&>h3]:uppercase [&>h3]:text-navy",
  "[&>h2+*]:mt-[0.7em] [&>h3+*]:mt-[0.6em]",
  // Inline.
  "[&_a]:underline [&_a]:decoration-gold [&_a]:decoration-[1.5px] [&_a]:underline-offset-[0.18em] [&_a]:transition-colors",
  "[&_a:hover]:text-navy [&_a:hover]:decoration-navy [&_a:active]:text-navy-deep [&_strong]:font-semibold",
  // Lists.
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:pl-1 [&_li+li]:mt-2 [&_li]:marker:text-gold [&_li>p]:m-0",
  // Section break.
  "[&>hr]:mx-auto [&>hr]:my-12 [&>hr]:h-[2px] [&>hr]:w-20 [&>hr]:border-0 [&>hr]:bg-gold",
  // Block images, a little wider than the text column on desktop.
  "[&>img]:my-10 [&>img]:h-auto [&>img]:w-full [&>img]:max-w-none [&>img]:bg-paper-2",
  "lg:[&>img]:-mx-10 lg:[&>img]:w-[calc(100%+5rem)]",
  // Pull quotes.
  "[&>blockquote]:relative [&>blockquote]:my-14 [&>blockquote]:py-8 lg:[&>blockquote]:-mx-10",
  "[&>blockquote]:font-serif [&>blockquote]:text-[clamp(1.6rem,3vw,2.3rem)] [&>blockquote]:leading-[1.18] [&>blockquote]:tracking-[-0.015em] [&>blockquote]:text-navy [&>blockquote]:italic",
  "[&>blockquote_p+p]:mt-3",
  "[&>blockquote]:before:absolute [&>blockquote]:before:inset-x-0 [&>blockquote]:before:top-0 [&>blockquote]:before:h-[3px] [&>blockquote]:before:bg-gold [&>blockquote]:before:content-['']",
  "[&>blockquote]:after:absolute [&>blockquote]:after:inset-x-0 [&>blockquote]:after:bottom-0 [&>blockquote]:after:h-px [&>blockquote]:after:bg-ink [&>blockquote]:after:content-['']",
  "[&>blockquote]:before:origin-left [&>blockquote]:after:origin-right",
  "[&>blockquote]:before:[transform:scaleX(var(--rule,1))] [&>blockquote]:after:[transform:scaleX(var(--rule,1))]",
);

export function ArticleBody({ body, id }: { body: unknown; id?: string }) {
  const html = renderArticleBody(body).replace(/<img /g, '<img loading="lazy" decoding="async" ');
  if (!html.trim()) {
    return (
      <p id={id} className="font-serif text-lg text-ink-soft">
        The full text of this story has not been added yet.
      </p>
    );
  }
  return (
    <BodyMotion>
      <div id={id} className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
    </BodyMotion>
  );
}
