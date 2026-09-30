"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { slugify } from "@/lib/format";
import { checkSlugAvailable, deleteArticle, saveArticle } from "@/lib/dashboard/articles";
import { createTag, type Tag } from "@/lib/dashboard/tags";
import { isoToRiyadhInput, riyadhInputToIso, SLUG_PATTERN, type ArticleInput } from "@/lib/dashboard/types";
import { ConfirmButton } from "./ConfirmButton";
import { ImageField } from "./ImageField";
import { RichText } from "./RichText";
import { articleStatus, btn, field, Notice, StatusBadge } from "./ui";
import { useUnsavedWarning } from "./useUnsavedWarning";

type Section = { id: number; slug: string; name: string };
type Staff = { id: string; name: string; role: string; is_active: boolean };

export function ArticleEditor({
  initial,
  saved,
  sections,
  staff,
  tags: initialTags,
  isPlaceholder = false,
}: {
  initial: ArticleInput;
  // The last saved state, for the status badge and the public link.
  saved: { status: string; published_at: string | null; slug: string; section_slug: string } | null;
  sections: Section[];
  staff: Staff[];
  tags: Tag[];
  isPlaceholder?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [publishAt, setPublishAt] = useState(isoToRiyadhInput(initial.published_at));
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [slugTaken, setSlugTaken] = useState(false);
  const [tags, setTags] = useState(initialTags);
  const [tagQuery, setTagQuery] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const [tagBusy, startTag] = useTransition();

  useUnsavedWarning(dirty);

  function update<K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function onTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
    setDirty(true);
  }

  // Debounced uniqueness check whenever the slug changes.
  useEffect(() => {
    const t = setTimeout(async () => {
      setSlugTaken(SLUG_PATTERN.test(form.slug) && !(await checkSlugAvailable(form.slug, form.id)));
    }, 400);
    return () => clearTimeout(t);
  }, [form.slug, form.id]);

  function save(status = form.status) {
    setMessage(null);
    const payload: ArticleInput = {
      ...form,
      status,
      published_at: riyadhInputToIso(publishAt),
      // ProseMirror stores attrs in null-prototype objects, which server action
      // serialization drops (links lose href, headings lose level). Text is safe.
      body: JSON.stringify(form.body),
    };
    startSaving(async () => {
      const res = await saveArticle(payload);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        setMessage({ tone: "error", text: res.error });
        return;
      }
      setErrors({});
      setDirty(false);
      setForm((f) => ({ ...f, status }));
      setPublishAt(isoToRiyadhInput(res.published_at ?? null));
      const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(
        new Date(),
      );
      setMessage({ tone: "success", text: `Saved at ${time}.` });
      if (!form.id && res.id) router.replace(`/dashboard/articles/${res.id}`);
      else router.refresh();
    });
  }

  // Authors keep their order; the first one leads the byline.
  const authorIds = form.author_ids;
  const moveAuthor = (i: number, dir: -1 | 1) => {
    const next = [...authorIds];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    update("author_ids", next);
  };
  const staffById = new Map(staff.map((s) => [s.id, s]));
  const availableStaff = staff.filter((s) => !authorIds.includes(s.id));

  const tagById = new Map(tags.map((t) => [t.id, t]));
  const q = tagQuery.trim().toLowerCase();
  const suggestions = q
    ? tags.filter((t) => !form.tag_ids.includes(t.id) && t.name.toLowerCase().includes(q)).slice(0, 6)
    : [];
  const exact = tags.find((t) => t.name.toLowerCase() === q || t.slug === slugify(q));

  function addTag(tag: Tag) {
    if (!form.tag_ids.includes(tag.id)) update("tag_ids", [...form.tag_ids, tag.id]);
    setTagQuery("");
    setTagError(null);
  }

  function createAndAddTag() {
    const name = tagQuery.trim();
    if (!name) return;
    if (exact) return addTag(exact);
    startTag(async () => {
      const res = await createTag(name);
      if (!res.ok) return setTagError(res.error);
      setTags((all) => (all.some((t) => t.id === res.tag.id) ? all : [...all, res.tag]));
      addTag(res.tag);
    });
  }

  const savedStatus = saved ? articleStatus(saved.status, saved.published_at) : null;
  const publicHref = saved && saved.status === "published" ? `/${saved.section_slug}/${saved.slug}` : null;
  const willPublish = form.status === "published";
  const err = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} className={field.error}>
        {errors[k]}
      </p>
    ) : null;
  const invalid = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `err-${k}` } : {});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <div className="sticky top-0 z-20 -mx-5 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink bg-paper/95 px-5 py-3 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex min-w-0 flex-wrap items-center gap-3 font-sans text-[13px] text-ink-soft">
          {savedStatus ? <StatusBadge status={savedStatus} /> : <StatusBadge status="draft" />}
          <span aria-live="polite">
            {saving ? "Saving..." : dirty ? "Unsaved changes" : message?.tone === "success" ? message.text : "All changes saved"}
          </span>
          {publicHref ? (
            <a href={publicHref} target="_blank" rel="noopener" className={btn.link}>
              View on site<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {willPublish ? null : (
            <button type="button" className={btn.secondary} disabled={saving} onClick={() => save("published")}>
              Publish now
            </button>
          )}
          <button type="submit" className={btn.primary} disabled={saving}>
            {willPublish ? (saved?.status === "published" ? "Update article" : "Publish") : "Save draft"}
          </button>
        </div>
      </div>

      {message?.tone === "error" ? (
        <div className="mb-6">
          <Notice tone="error">{message.text}</Notice>
        </div>
      ) : null}
      {isPlaceholder ? (
        <div className="mb-6">
          <Notice>
            This is placeholder content. &ldquo;Delete all placeholder content&rdquo; on the Articles page removes it,
            even after edits.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div>
            <label htmlFor="title" className={field.label}>
              Headline
            </label>
            <textarea
              id="title"
              rows={2}
              value={form.title}
              onChange={(e) => onTitle(e.target.value.replace(/\n/g, " "))}
              placeholder="Write a clear, specific headline"
              className="mt-1.5 block w-full resize-none border-0 border-b border-rule bg-transparent px-0 py-2 font-serif text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-ink placeholder:text-ink-soft/50 hover:border-ink-soft focus:border-navy aria-[invalid=true]:border-ink [field-sizing:content] sm:text-[2.75rem]"
              {...invalid("title")}
            />
            {err("title")}
          </div>

          <div>
            <label htmlFor="slug" className={field.label}>
              Web address
            </label>
            <div className="mt-1.5 flex items-stretch border border-rule bg-cream font-sans text-[15px] focus-within:border-navy">
              <span className="hidden items-center border-r border-rule bg-paper-2 px-3 text-ink-soft sm:flex">
                /{sections.find((s) => s.id === form.section_id)?.slug ?? "section"}/
              </span>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", slugify(e.target.value.replace(/\s/g, "-")) + (/[\s-]$/.test(e.target.value) ? "-" : ""));
                }}
                onBlur={() => slugify(form.slug) !== form.slug && update("slug", slugify(form.slug))}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink"
                aria-describedby="slug-hint"
                {...invalid("slug")}
              />
            </div>
            <p id="slug-hint" className={slugTaken ? field.error : field.hint}>
              {slugTaken
                ? "Another article already uses this address. Change it before saving."
                : saved?.status === "published"
                  ? "Changing the address of a published article breaks links people have already shared."
                  : "Filled in from the headline. Lowercase letters, numbers and hyphens."}
            </p>
            {err("slug")}
          </div>

          <div>
            <label htmlFor="dek" className={field.label}>
              Summary
            </label>
            <textarea
              id="dek"
              rows={2}
              value={form.dek}
              onChange={(e) => update("dek", e.target.value)}
              placeholder="One or two sentences shown under the headline and in search results"
              className={`${field.input} resize-y font-serif text-[18px] leading-snug [field-sizing:content]`}
              {...invalid("dek")}
            />
            {err("dek")}
          </div>

          <div>
            <p id="body-label" className={field.label}>
              Article
            </p>
            <p id="body-hint" className={field.hint}>
              Quotes become pull quotes on the site. Keyboard shortcuts work: Ctrl or Cmd with B, I, U, Z.
            </p>
            <div className="mt-2">
              <RichText
                initial={initial.body}
                onChange={(doc: JSONContent) => update("body", doc)}
                error={errors.body}
                describedBy={errors.body ? "err-body body-hint" : "body-hint"}
              />
            </div>
            {err("body")}
          </div>
        </div>

        <aside className="space-y-8 lg:border-l lg:border-rule lg:pl-8">
          <fieldset className="space-y-4">
            <legend className="mb-3 w-full border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
              Publishing
            </legend>
            <div>
              <label htmlFor="status" className={field.label}>
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => update("status", e.target.value as ArticleInput["status"])}
                className={field.select}
              >
                <option value="draft">Draft (only editors can see it)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label htmlFor="publish-at" className={field.label}>
                Publish date, Riyadh time
              </label>
              <input
                id="publish-at"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => {
                  setPublishAt(e.target.value);
                  setDirty(true);
                }}
                className={field.input}
                aria-describedby="publish-hint"
              />
              <p id="publish-hint" className={field.hint}>
                Leave empty to use the moment you publish. A future date keeps the article hidden until then.
              </p>
            </div>
            <div>
              <label htmlFor="section" className={field.label}>
                Section
              </label>
              <select
                id="section"
                value={form.section_id}
                onChange={(e) => update("section_id", Number(e.target.value))}
                className={field.select}
                {...invalid("section")}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {err("section")}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 w-full border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
              Placement
            </legend>
            {(
              [
                ["is_lead", "Top story", "Leads the homepage. The newest top story wins."],
                ["is_editors_pick", "Article of the Month", "Featured in the Article of the Month slot."],
                ["in_ticker", "Show in ticker", "Runs in the moving headline bar at the top of the site."],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex cursor-pointer gap-3 py-1">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="mt-1 size-4 shrink-0 accent-navy"
                />
                <span>
                  <span className="block font-sans text-[14px] font-semibold text-ink">{label}</span>
                  <span className="block font-sans text-[13px] leading-snug text-ink-soft">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend className="mb-3 w-full border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
              Byline
            </legend>
            {authorIds.length ? (
              <ol className="mb-3 divide-y divide-rule border-y border-rule" aria-describedby={errors.authors ? "err-authors" : undefined}>
                {authorIds.map((id, i) => {
                  const person = staffById.get(id);
                  return (
                    <li key={id} className="flex items-center gap-2 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-sans text-[14px] font-semibold text-ink">
                          {person?.name ?? "Removed staff member"}
                        </span>
                        <span className="block truncate font-sans text-[12px] text-ink-soft">{person?.role}</span>
                      </span>
                      <button
                        type="button"
                        className={`${btn.quiet} px-2`}
                        onClick={() => moveAuthor(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${person?.name ?? "author"} up`}
                      >
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 8l4-4 4 4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={`${btn.quiet} px-2`}
                        onClick={() => moveAuthor(i, 1)}
                        disabled={i === authorIds.length - 1}
                        aria-label={`Move ${person?.name ?? "author"} down`}
                      >
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 4l4 4 4-4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={`${btn.quiet} px-2`}
                        onClick={() => update("author_ids", authorIds.filter((a) => a !== id))}
                        aria-label={`Remove ${person?.name ?? "author"}`}
                      >
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 3l6 6M9 3l-6 6" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : null}
            <label htmlFor="add-author" className="sr-only">
              Add an author
            </label>
            <select
              id="add-author"
              value=""
              onChange={(e) => e.target.value && update("author_ids", [...authorIds, e.target.value])}
              className={field.select}
              {...invalid("authors")}
            >
              <option value="">{authorIds.length ? "Add another author" : "Add an author"}</option>
              {availableStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}, {s.role}
                  {s.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
            {err("authors")}
            <p className={field.hint}>
              Missing someone?{" "}
              <Link href="/dashboard/team/new" className={btn.link}>
                Add them to the team
              </Link>
            </p>
          </fieldset>

          <fieldset>
            <legend className="mb-3 w-full border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
              Tags
            </legend>
            {form.tag_ids.length ? (
              <ul className="mb-3 flex flex-wrap gap-1.5">
                {form.tag_ids.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => update("tag_ids", form.tag_ids.filter((t) => t !== id))}
                      className="group inline-flex items-center gap-1.5 border border-rule bg-cream px-2 py-1 font-sans text-[13px] text-ink transition-colors hover:border-ink active:translate-y-px"
                      aria-label={`Remove tag ${tagById.get(id)?.name ?? ""}`}
                    >
                      {tagById.get(id)?.name ?? "Deleted tag"}
                      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft group-hover:text-ink">
                        <path d="M3 3l6 6M9 3l-6 6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex gap-2">
              <label htmlFor="tag-input" className="sr-only">
                Find or create a tag
              </label>
              <input
                id="tag-input"
                value={tagQuery}
                onChange={(e) => {
                  setTagQuery(e.target.value);
                  setTagError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestions[0] && !exact) addTag(suggestions[0]);
                    else createAndAddTag();
                  }
                }}
                placeholder="Find or create a tag"
                autoComplete="off"
                className={`${field.input} mt-0`}
              />
              <button type="button" className={btn.quiet} onClick={createAndAddTag} disabled={!tagQuery.trim() || tagBusy}>
                Add
              </button>
            </div>
            {suggestions.length || (q && !exact) ? (
              <ul className="mt-1 border border-rule bg-cream font-sans text-[14px]">
                {suggestions.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => addTag(t)}
                      className="block w-full px-3 py-1.5 text-left text-ink transition-colors hover:bg-paper-2 active:bg-rule"
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
                {q && !exact ? (
                  <li>
                    <button
                      type="button"
                      onClick={createAndAddTag}
                      disabled={tagBusy}
                      className="block w-full border-t border-rule px-3 py-1.5 text-left text-navy transition-colors hover:bg-paper-2 active:bg-rule disabled:opacity-50"
                    >
                      {tagBusy ? "Creating..." : `Create tag "${tagQuery.trim()}"`}
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : null}
            {tagError ? (
              <p role="alert" className={field.error}>
                {tagError}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-3 w-full border-b border-ink pb-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
              Cover photo
            </legend>
            <ImageField
              label="Image"
              folder="covers"
              value={form.cover_url}
              onChange={(url) => update("cover_url", url)}
              error={errors.cover}
            />
            <div>
              <label htmlFor="cover-alt" className={field.label}>
                Description for screen readers{form.cover_url ? " (required)" : ""}
              </label>
              <input
                id="cover-alt"
                value={form.cover_alt}
                onChange={(e) => update("cover_alt", e.target.value)}
                placeholder="What the photo shows"
                className={field.input}
                {...invalid("cover_alt")}
              />
              {err("cover_alt")}
            </div>
            <div>
              <label htmlFor="cover-caption" className={field.label}>
                Caption
              </label>
              <input
                id="cover-caption"
                value={form.cover_caption}
                onChange={(e) => update("cover_caption", e.target.value)}
                className={field.input}
              />
            </div>
            <div>
              <label htmlFor="cover-credit" className={field.label}>
                Photo credit
              </label>
              <input
                id="cover-credit"
                value={form.cover_credit}
                onChange={(e) => update("cover_credit", e.target.value)}
                placeholder="Photo by ..."
                className={field.input}
              />
            </div>
          </fieldset>

          {form.id ? (
            <div className="border-t border-ink pt-5">
              <ConfirmButton
                label="Delete article"
                title="Delete this article?"
                redirectTo="/dashboard/articles"
                action={() => deleteArticle(form.id!)}
              >
                <p>
                  &ldquo;{initial.title}&rdquo; will be removed from the site, along with its cover photo and any
                  images in the body. This cannot be undone.
                </p>
              </ConfirmButton>
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
