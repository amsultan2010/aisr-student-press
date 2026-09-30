import Link from "next/link";
import type { StaffMember } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { cx } from "@/components/ui/cx";
import { PlaceholderTag } from "@/components/ui/PlaceholderTag";

// One person in the staff directory. The whole card links to their author page.
export function StaffCard({ person, size = "sm" }: { person: StaffMember; size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <Link
      href={`/author/${person.slug}`}
      className={cx(
        "group -mx-3 flex h-full gap-5 px-3 transition-colors hover:bg-cream active:bg-paper-2",
        lg ? "flex-col py-7 md:py-8" : "items-center py-5",
      )}
    >
      <Avatar
        name={person.name}
        photoUrl={person.photo_url}
        size={lg ? 88 : 52}
        className={person.is_placeholder ? "opacity-45 grayscale" : undefined}
      />
      <div className="min-w-0">
        <p
          className={cx(
            "font-serif leading-tight tracking-[-0.015em] underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:text-navy group-hover:decoration-current",
            lg ? "text-3xl" : "text-xl",
            person.is_placeholder && "text-ink-soft",
          )}
        >
          {person.name}
        </p>
        <p className="mt-1.5 font-sans text-[12px] font-semibold tracking-[0.1em] text-ink-soft uppercase">
          {person.role}
          {person.grade ? <span className="font-normal normal-case tracking-normal">, Grade {person.grade.replace(/^grade\s*/i, "")}</span> : null}
        </p>
        {person.is_placeholder ? <PlaceholderTag className="mt-2.5" /> : null}
        {lg && person.bio ? <p className="mt-4 line-clamp-3 font-serif text-base leading-relaxed text-ink-soft">{person.bio}</p> : null}
      </div>
    </Link>
  );
}
