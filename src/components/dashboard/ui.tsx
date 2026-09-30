import Link from "next/link";

// Shared class strings so every control in the dashboard has the same hover,
// focus-visible (global gold outline), active and disabled states.
const base =
  "inline-flex items-center justify-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0";

export const btn = {
  primary: `${base} bg-navy px-4 py-2.5 text-cream hover:bg-navy-deep`,
  secondary: `${base} border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-paper disabled:hover:bg-transparent disabled:hover:text-ink`,
  quiet: `${base} border border-rule px-3 py-1.5 text-ink-soft hover:border-ink hover:text-ink`,
  link: "font-sans text-sm font-semibold text-navy underline decoration-rule underline-offset-4 transition-colors hover:decoration-navy active:text-navy-deep",
};

export const field = {
  label: "block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ink",
  hint: "mt-1 font-sans text-[13px] leading-snug text-ink-soft",
  error: "mt-1 font-sans text-[13px] font-semibold leading-snug text-ink",
  input:
    "mt-1.5 block w-full border border-rule bg-cream px-3 py-2 font-sans text-[16px] md:text-[15px] text-ink placeholder:text-ink-soft/70 transition-colors hover:border-ink-soft focus:border-navy aria-[invalid=true]:border-ink aria-[invalid=true]:border-l-4 disabled:opacity-60",
  select:
    "mt-1.5 block w-full border border-rule bg-cream px-3 py-2 font-sans text-[16px] md:text-[15px] text-ink transition-colors hover:border-ink-soft focus:border-navy",
};

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-ink pb-5">
      <div>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-navy">{kicker}</p>
        <h1 className="mt-1 font-serif text-[2.5rem] font-medium leading-[1.02] tracking-[-0.025em] text-ink md:text-[3.25rem]">
          {title}
        </h1>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-rule pb-2">
      <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-rule bg-paper-2/50 px-6 py-10">
      <p className="font-serif text-xl text-ink">{title}</p>
      {children ? <div className="mt-2 max-w-prose font-sans text-sm text-ink-soft">{children}</div> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-l-4 border-navy bg-paper-2",
    error: "border-l-4 border-ink bg-gold-soft/60",
    success: "border-l-4 border-gold bg-paper-2",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`${styles} px-4 py-3 font-sans text-sm text-ink`}>
      {children}
    </div>
  );
}

export type ArticleStatus = "draft" | "published" | "scheduled";

export function articleStatus(status: string, publishedAt: string | null): ArticleStatus {
  if (status !== "published") return "draft";
  if (publishedAt && new Date(publishedAt).getTime() > Date.now()) return "scheduled";
  return "published";
}

export function StatusBadge({ status }: { status: ArticleStatus }) {
  const styles = {
    published: "bg-navy text-cream",
    scheduled: "border border-gold text-ink",
    draft: "border border-ink-soft/50 text-ink-soft",
  }[status];
  return (
    <span className={`inline-block px-2 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${styles}`}>
      {status}
    </span>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
    >
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2 4 7l5 5" />
      </svg>
      {children}
    </Link>
  );
}
