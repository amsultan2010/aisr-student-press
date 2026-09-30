import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dashboard/auth";
import { getSubmission } from "@/lib/dashboard/queries";
import { formatDate } from "@/lib/format";
import { SECTIONS, SITE } from "@/lib/site";
import { SubmissionActions } from "@/components/dashboard/SubmissionActions";
import { BackLink, PageHeader, btn } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Submission" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KIND = { pitch: "Story pitch", article: "Finished article", letter: "Letter to the editor", photo: "Photo", contact: "Message" };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const s = await getSubmission(supabase, id);
  if (!s) notFound();

  const kind = KIND[s.kind as keyof typeof KIND] ?? s.kind;
  const subject = `Re: ${s.title || kind} (${SITE.name})`;
  const mailto = `mailto:${s.email}?subject=${encodeURIComponent(subject)}`;
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(
    new Date(s.created_at),
  );

  return (
    <>
      <BackLink href="/dashboard/submissions">Inbox</BackLink>
      <PageHeader kicker={kind} title={s.title || `${kind} from ${s.name}`}>
        <a href={mailto} className={btn.primary}>
          Reply by email
        </a>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <p className="max-w-[68ch] whitespace-pre-wrap font-serif text-[19px] leading-[1.6] text-ink">{s.message}</p>
        </article>

        <aside className="space-y-6 lg:border-l lg:border-rule lg:pl-8">
          <dl className="space-y-3 font-sans text-[14px]">
            {[
              ["From", s.name],
              ["Email", s.email],
              ["Grade", s.grade],
              ["Section", SECTIONS.find((sec) => sec.slug === s.section_slug)?.name ?? s.section_slug],
              ["Sent", `${formatDate(s.created_at)}, ${time}`],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{k}</dt>
                  <dd className="break-words text-ink">{v}</dd>
                </div>
              ))}
          </dl>

          {s.attachment_path ? (
            <div className="border-t border-rule pt-4">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">Attachment</p>
              {s.attachmentUrl ? (
                <a href={s.attachmentUrl} className={`${btn.secondary} mt-2`}>
                  Download {s.attachment_path.split(".").pop()?.toUpperCase()} file
                </a>
              ) : (
                <p className="mt-1 font-sans text-sm text-ink">The file could not be found in storage.</p>
              )}
              <p className="mt-2 font-sans text-[12px] text-ink-soft">The download link works for 10 minutes.</p>
            </div>
          ) : null}

          <div className="border-t border-rule pt-4">
            <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Status: {s.status === "new" ? "read" : s.status}
            </p>
            <SubmissionActions id={s.id} status={s.status} from={s.name} />
          </div>
        </aside>
      </div>
    </>
  );
}
