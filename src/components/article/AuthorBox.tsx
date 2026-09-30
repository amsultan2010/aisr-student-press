import Link from "next/link";
import type { Author } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Arrow } from "@/components/ui/Arrow";

// "About the author" panel at the end of a story, one row per byline.
export function AuthorBox({ authors }: { authors: (Author & { bio: string })[] }) {
  if (!authors.length) return null;
  return (
    <section aria-labelledby="about-author" className="mt-16 border-t-[3px] border-ink">
      <h2 id="about-author" className="pt-4 font-sans text-[11px] font-semibold tracking-[0.14em] text-navy uppercase">
        About the {authors.length > 1 ? "authors" : "author"}
      </h2>
      <ul>
        {authors.map((a) => {
          const first = a.name.split(/\s+/)[0];
          return (
            <li key={a.slug} className="grid grid-cols-[4.5rem_1fr] gap-5 border-b border-rule py-7">
              <Avatar name={a.name} photoUrl={a.photo_url} size={72} />
              <div>
                <p className="font-serif text-2xl leading-tight tracking-[-0.015em]">
                  <Link href={`/author/${a.slug}`} className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-navy hover:decoration-current active:text-navy-deep">
                    {a.name}
                  </Link>
                </p>
                <p className="mt-1 font-sans text-[12px] font-semibold tracking-[0.1em] text-ink-soft uppercase">{a.role}</p>
                <p className="mt-3 font-serif text-[1.0625rem] leading-relaxed text-ink/85">
                  {a.bio || `${first} writes for The AISR Student Press.`}
                </p>
                <Link
                  href={`/author/${a.slug}`}
                  className="group mt-4 inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.12em] text-navy uppercase transition-colors hover:text-ink active:text-navy-deep"
                >
                  All stories by {a.name}
                  <Arrow />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
