"use client";

import { useId, useRef, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { SECTIONS } from "@/lib/site";
import { D, E, MQ, gsap, useGSAP } from "@/lib/motion";
import { cx } from "@/components/ui/cx";
import { Arrow } from "@/components/ui/Arrow";
import { Button, LinkButton, buttonClass } from "@/components/ui/Button";

export type SubmissionKind = "pitch" | "article" | "letter" | "photo" | "contact";

const KINDS: { value: SubmissionKind; label: string; hint: string }[] = [
  { value: "pitch", label: "Pitch a story", hint: "An idea you want to report, or want us to cover." },
  { value: "article", label: "Submit an article", hint: "A finished piece you wrote yourself." },
  { value: "letter", label: "Letter to the editor", hint: "A response to something we published." },
  { value: "photo", label: "Photo or artwork", hint: "Photography, digital art or illustration." },
  { value: "contact", label: "General contact", hint: "Questions, corrections, or anything else." },
];

const COPY: Record<SubmissionKind, { title: string; titleHint: string; message: string; messageHint: string; sent: string }> = {
  pitch: {
    title: "Working headline",
    titleHint: "One line. It does not have to be perfect.",
    message: "Your pitch",
    messageHint: "What is the story, who would you talk to, and why does it matter now?",
    sent: "pitch",
  },
  article: {
    title: "Headline",
    titleHint: "The headline you would give your piece.",
    message: "Your article",
    messageHint: "Paste the full text here, or attach it as a PDF and add a short note.",
    sent: "article",
  },
  letter: {
    title: "Subject",
    titleHint: "Which story are you responding to?",
    message: "Your letter",
    messageHint: "Letters are usually under 300 words. We may edit for length and clarity.",
    sent: "letter",
  },
  photo: {
    title: "Title of the work",
    titleHint: "A short title or caption.",
    message: "About the work",
    messageHint: "Where and when it was made, who is in it, and anything we should know.",
    sent: "photo",
  },
  contact: {
    title: "Subject",
    titleHint: "What is this about?",
    message: "Message",
    messageHint: "For corrections, include the story and what is wrong.",
    sent: "message",
  },
};

const GRADES = ["6", "7", "8", "9", "10", "11", "12", "Faculty or staff", "Parent", "Other"];
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  pdf: "application/pdf",
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Values = {
  kind: SubmissionKind;
  name: string;
  email: string;
  grade: string;
  section: string;
  title: string;
  message: string;
};
type Field = keyof Values | "file";
type Errors = Partial<Record<Field, string>>;
type Status = { state: "idle" } | { state: "sending"; step: string } | { state: "error"; message: string } | { state: "sent"; id: string };

function fileType(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED[ext] ?? (Object.values(ALLOWED).includes(file.type) ? file.type : null);
}

function safeFilename(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function validate(v: Values, file: File | null): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Tell us your name.";
  else if (v.name.trim().length > 120) e.name = "Keep your name under 120 characters.";
  if (!v.email.trim()) e.email = "We need an email address to reply to you.";
  else if (!EMAIL.test(v.email.trim()) || v.email.trim().length > 200) e.email = "That email address does not look right.";
  if (!v.title.trim()) e.title = "Add a short headline or subject.";
  else if (v.title.trim().length > 200) e.title = "Keep this under 200 characters.";
  if (!v.message.trim()) e.message = "This part cannot be empty.";
  else if (v.message.length > 10000) e.message = "This is over 10,000 characters. Attach a PDF instead.";
  if (v.kind === "photo" && !file) e.file = "Attach the photo or artwork you want to submit.";
  if (file) {
    if (!fileType(file)) e.file = "Attach a JPG, PNG, WEBP, HEIC or PDF file.";
    else if (file.size > MAX_BYTES) e.file = `That file is ${formatBytes(file.size)}. The limit is 10 MB.`;
  }
  return e;
}

const ORDER: Field[] = ["name", "email", "title", "message", "file"];

export function SubmitForm({ initialKind = "pitch" }: { initialKind?: SubmissionKind }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Values>({
    kind: initialKind,
    name: "",
    email: "",
    grade: "",
    section: "",
    title: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [trap, setTrap] = useState("");

  const errors = validate(values, file);
  const show = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const copy = COPY[values.kind];
  const sending = status.state === "sending";

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }));

  // Success panel: clip reveal and a drawn check mark.
  useGSAP(
    () => {
      if (status.state !== "sent") return;
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop + ", " + MQ.mobile, () => {
        gsap.from("[data-sent]", { clipPath: "inset(0% 0% 100% 0%)", duration: D.slow, ease: E.inOut });
        gsap.from("[data-sent-check]", { drawSVG: "0%", duration: D.slow, delay: 0.35, ease: E.out });
        gsap.from("[data-sent-line]", { yPercent: 100, autoAlpha: 0, stagger: 0.08, delay: 0.25 });
      });
    },
    { scope: root, dependencies: [status.state] },
  );

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (sending) return;
    setSubmitted(true);
    const found = validate(values, file);
    const first = ORDER.find((f) => found[f]);
    if (first) {
      const el = document.getElementById(`${uid}-${first}`);
      el?.focus();
      return;
    }

    const id = crypto.randomUUID();
    // Bots fill hidden fields. Pretend it worked and send nothing.
    if (trap) {
      setStatus({ state: "sent", id });
      return;
    }

    const supabase = browserClient();
    try {
      let attachment_path: string | null = null;
      if (file) {
        setStatus({ state: "sending", step: "Uploading your file" });
        const path = `incoming/${id}-${safeFilename(file.name)}`;
        const { error } = await supabase.storage
          .from("submissions")
          .upload(path, file, { contentType: fileType(file) ?? undefined, upsert: false });
        if (error) throw new Error("upload");
        attachment_path = path;
      }
      setStatus({ state: "sending", step: "Sending" });
      const { error } = await supabase.from("submissions").insert({
        id,
        kind: values.kind,
        name: values.name.trim(),
        email: values.email.trim(),
        grade: values.grade || null,
        section_slug: values.kind === "contact" ? null : values.section || null,
        title: values.title.trim(),
        message: values.message.trim(),
        attachment_path,
      });
      if (error) throw new Error("insert");
      setStatus({ state: "sent", id });
      root.current?.scrollIntoView({ block: "start", behavior: matchMedia(MQ.reduced).matches ? "auto" : "smooth" });
    } catch (err) {
      setStatus({
        state: "error",
        message:
          err instanceof Error && err.message === "upload"
            ? "Your file could not be uploaded. Check that it is under 10 MB and try again, or send it without the file."
            : "Something went wrong and your submission was not sent. Check your connection and try again.",
      });
    }
  }

  function reset() {
    setValues((v) => ({ ...v, title: "", message: "" }));
    setFile(null);
    setTouched({});
    setSubmitted(false);
    setStatus({ state: "idle" });
    if (fileInput.current) fileInput.current.value = "";
  }

  if (status.state === "sent") {
    return (
      <div ref={root} className="scroll-mt-32">
        <div data-sent role="status" className="border-t-[3px] border-ink bg-navy-deep px-6 py-12 text-paper md:px-12 md:py-16">
          <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden className="text-gold-soft">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path data-sent-check d="M19 33 l9 9 l18 -20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          </svg>
          <div className="overflow-hidden">
            <p data-sent-line className="mt-8 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.025em]">
              Thanks{values.name.trim() ? `, ${values.name.trim().split(/\s+/)[0]}` : ""}. Your {COPY[values.kind].sent} is in.
            </p>
          </div>
          <div className="overflow-hidden">
            <p data-sent-line className="mt-5 max-w-[52ch] font-serif text-lg leading-relaxed text-paper/80">
              An editor will read it and reply to {values.email.trim() || "you"} if we want to take it further. You do not
              need to send it again.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="gold" size="lg" onClick={reset}>
              Send something else
            </Button>
            <LinkButton href="/" variant="paper" size="lg" arrow>
              Back to the front page
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const fieldId = (f: Field) => `${uid}-${f}`;
  const describe = (f: Field, hint?: boolean) =>
    [hint ? `${fieldId(f)}-hint` : "", show(f) ? `${fieldId(f)}-error` : ""].filter(Boolean).join(" ") || undefined;
  const inputClass = (f: Field) =>
    cx(
      "block w-full border bg-cream px-4 py-3 font-serif text-lg text-ink placeholder:text-ink-soft/60 transition-colors outline-offset-2 hover:border-ink/70 focus:border-navy disabled:cursor-not-allowed disabled:opacity-60",
      show(f) ? "border-2 border-ink" : "border-ink/25",
    );

  return (
    <div ref={root} className="scroll-mt-32">
      <form onSubmit={onSubmit} noValidate aria-describedby={`${uid}-required`} className="space-y-10">
        <p id={`${uid}-required`} className="font-sans text-xs text-ink-soft">
          Fields marked <span aria-hidden>*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>

        <fieldset disabled={sending}>
          <legend className="font-sans text-xs font-semibold tracking-[0.14em] text-navy uppercase">
            What are you sending? <span aria-hidden>*</span>
          </legend>
          <div className="mt-4 grid border-t border-l border-ink/25 sm:grid-cols-2">
            {KINDS.map((k) => {
              const checked = values.kind === k.value;
              return (
                <label
                  key={k.value}
                  className={cx(
                    "group relative flex cursor-pointer gap-4 border-r border-b border-ink/25 px-5 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-3px] has-[:focus-visible]:outline-gold has-[:disabled]:cursor-not-allowed",
                    checked ? "bg-navy text-paper" : "bg-cream hover:bg-paper-2 active:bg-rule/60",
                    k.value === "contact" && "sm:col-span-2",
                  )}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={k.value}
                    checked={checked}
                    onChange={() => set("kind", k.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cx(
                      "mt-1.5 size-3 shrink-0 border transition-colors",
                      checked ? "border-gold-soft bg-gold-soft" : "border-ink/50 group-hover:border-ink",
                    )}
                  />
                  <span>
                    <span className="block font-serif text-xl leading-tight">{k.label}</span>
                    <span className={cx("mt-1 block font-sans text-[13px] leading-snug", checked ? "text-paper/75" : "text-ink-soft")}>
                      {k.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset disabled={sending} className="grid gap-x-6 gap-y-7 md:grid-cols-2">
          <legend className="sr-only">About you</legend>
          <FieldShell id={fieldId("name")} label="Your name" required error={show("name")}>
            <input
              id={fieldId("name")}
              name="name"
              autoComplete="name"
              maxLength={120}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              aria-invalid={Boolean(show("name"))}
              aria-describedby={describe("name")}
              className={inputClass("name")}
            />
          </FieldShell>
          <FieldShell
            id={fieldId("email")}
            label="Email"
            required
            aside="Only used to reply to you"
            error={show("email")}
          >
            <input
              id={fieldId("email")}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              aria-invalid={Boolean(show("email"))}
              aria-describedby={describe("email")}
              className={inputClass("email")}
            />
          </FieldShell>
          <FieldShell id={fieldId("grade")} label="Grade">
            <select
              id={fieldId("grade")}
              name="grade"
              value={values.grade}
              onChange={(e) => set("grade", e.target.value)}
              className={cx(inputClass("grade"), "appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10")}
              style={{ backgroundImage: CHEVRON }}
            >
              <option value="">Prefer not to say</option>
              {GRADES.map((g) => (
                <option key={g} value={/^\d+$/.test(g) ? `Grade ${g}` : g}>
                  {/^\d+$/.test(g) ? `Grade ${g}` : g}
                </option>
              ))}
            </select>
          </FieldShell>
          {values.kind !== "contact" ? (
            <FieldShell id={fieldId("section")} label="Section">
              <select
                id={fieldId("section")}
                name="section"
                value={values.section}
                onChange={(e) => set("section", e.target.value)}
                className={cx(inputClass("section"), "appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10")}
                style={{ backgroundImage: CHEVRON }}
              >
                <option value="">Not sure yet</option>
                {SECTIONS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FieldShell>
          ) : null}
        </fieldset>

        <fieldset disabled={sending} className="space-y-7">
          <legend className="sr-only">Your submission</legend>
          <FieldShell id={fieldId("title")} label={copy.title} required hint={copy.titleHint} error={show("title")}>
            <input
              id={fieldId("title")}
              name="title"
              maxLength={200}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              onBlur={() => touch("title")}
              aria-invalid={Boolean(show("title"))}
              aria-describedby={describe("title", true)}
              className={inputClass("title")}
            />
          </FieldShell>
          <FieldShell
            id={fieldId("message")}
            label={copy.message}
            required
            hint={copy.messageHint}
            error={show("message")}
            aside={
              <span className={cx("tabular-nums", values.message.length > 10000 && "font-semibold text-ink")}>
                {values.message.length.toLocaleString("en")} / 10,000
              </span>
            }
          >
            <textarea
              id={fieldId("message")}
              name="message"
              rows={values.kind === "article" ? 14 : 8}
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              onBlur={() => touch("message")}
              aria-invalid={Boolean(show("message"))}
              aria-describedby={describe("message", true)}
              className={cx(inputClass("message"), "resize-y leading-relaxed")}
            />
          </FieldShell>

          <FieldShell
            id={fieldId("file")}
            label={values.kind === "photo" ? "Photo or artwork" : "Attachment"}
            required={values.kind === "photo"}
            hint="JPG, PNG, WEBP, HEIC or PDF, up to 10 MB."
            error={show("file")}
          >
            <div
              className={cx(
                "flex flex-wrap items-center gap-4 border border-dashed bg-cream px-4 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold",
                show("file") ? "border-2 border-ink" : "border-ink/35 hover:border-ink/70",
              )}
            >
              <input
                ref={fileInput}
                id={fieldId("file")}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,image/jpeg,image/png,image/webp,image/heic,application/pdf"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  touch("file");
                }}
                aria-invalid={Boolean(show("file"))}
                aria-describedby={describe("file", true)}
                className="peer sr-only"
              />
              <label
                htmlFor={fieldId("file")}
                className="cursor-pointer border border-ink px-4 py-2 font-sans text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:bg-ink hover:text-paper active:bg-navy-deep peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
              >
                {file ? "Choose a different file" : "Choose a file"}
              </label>
              {file ? (
                <span className="flex min-w-0 items-center gap-3 font-sans text-sm">
                  <span className="truncate font-semibold">{file.name}</span>
                  <span className="shrink-0 text-ink-soft">{formatBytes(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                    className="shrink-0 font-semibold text-navy underline underline-offset-4 hover:text-ink active:text-navy-deep disabled:opacity-50"
                  >
                    Remove<span className="sr-only"> {file.name}</span>
                  </button>
                </span>
              ) : (
                <span className="font-sans text-sm text-ink-soft">No file chosen</span>
              )}
            </div>
          </FieldShell>
        </fieldset>

        {/* Honeypot: hidden from people and screen readers, bots fill it in. */}
        <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input id={`${uid}-company`} name="company" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </div>

        {status.state === "error" ? (
          <div role="alert" className="flex gap-4 border-l-4 border-gold bg-paper-2 px-5 py-4 font-sans text-sm leading-relaxed">
            <ErrorMark />
            <p>{status.message}</p>
          </div>
        ) : null}

        {submitted && Object.keys(errors).length > 0 ? (
          <p role="alert" className="font-sans text-sm font-semibold text-ink">
            Fix the {Object.keys(errors).length === 1 ? "field" : `${Object.keys(errors).length} fields`} marked above, then send
            again.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-8">
          <button type="submit" disabled={sending} data-magnetic="" className={buttonClass("primary", "lg", "min-w-56")}>
            {sending ? (
              <>
                <span aria-hidden className="size-3 animate-spin border-2 border-paper/40 border-t-paper motion-reduce:animate-none" />
                {status.step}
              </>
            ) : (
              <>
                Send {values.kind === "contact" ? "message" : `your ${COPY[values.kind].sent}`} <Arrow />
              </>
            )}
          </button>
          <p className="max-w-[40ch] font-sans text-xs leading-relaxed text-ink-soft" aria-live="polite">
            {sending ? `${status.step}...` : "Submissions go straight to the editors, who read every one."}
          </p>
        </div>
      </form>
    </div>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23141a33' stroke-width='1.5'/%3E%3C/svg%3E")`;

function ErrorMark() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden className="mt-0.5 shrink-0 text-navy">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.5v6M10 13.5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-sans text-xs font-semibold tracking-[0.12em] text-ink uppercase">
          {label}
          {required ? <span aria-hidden> *</span> : null}
        </label>
        {aside ? <span className="font-sans text-xs text-ink-soft">{aside}</span> : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 font-sans text-[13px] leading-snug text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className="mt-2.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 font-sans text-sm font-semibold text-ink">
          <ErrorMark />
          {error}
        </p>
      ) : null}
    </div>
  );
}
