"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/format";
import { deleteStaff, saveStaff } from "@/lib/dashboard/staff";
import { ROLE_GROUPS, type StaffInput } from "@/lib/dashboard/types";
import { ConfirmButton } from "./ConfirmButton";
import { ImageField } from "./ImageField";
import { btn, field, Notice } from "./ui";
import { useUnsavedWarning } from "./useUnsavedWarning";

export function StaffForm({ initial, articleCount = 0 }: { initial: StaffInput; articleCount?: number }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [saving, start] = useTransition();

  useUnsavedWarning(dirty);

  function update<K extends keyof StaffInput>(key: K, value: StaffInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await saveStaff(form);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        setMessage({ tone: "error", text: res.error });
        return;
      }
      setErrors({});
      setDirty(false);
      setMessage({ tone: "success", text: "Saved." });
      if (!form.id && res.id) router.replace(`/dashboard/team/${res.id}`);
      else router.refresh();
    });
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} className={field.error}>
        {errors[k]}
      </p>
    ) : null;
  const invalid = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `err-${k}` } : {});

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div>
        <ImageField
          label="Photo"
          folder="staff"
          value={form.photo_url}
          onChange={(url) => update("photo_url", url)}
          aspect="aspect-square"
          round
          error={errors.photo}
        />
        <p className={field.hint}>A head-and-shoulders photo works best. It is cropped to a circle.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="s-name" className={field.label}>
              Name
            </label>
            <input
              id="s-name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                setDirty(true);
              }}
              className={field.input}
              autoComplete="off"
              {...invalid("name")}
            />
            {err("name")}
          </div>
          <div>
            <label htmlFor="s-slug" className={field.label}>
              Author page address
            </label>
            <div className="mt-1.5 flex items-stretch border border-rule bg-cream font-sans text-[15px] focus-within:border-navy">
              <span className="flex items-center border-r border-rule bg-paper-2 px-3 text-ink-soft">/author/</span>
              <input
                id="s-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                onBlur={() => slugify(form.slug) !== form.slug && update("slug", slugify(form.slug))}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink"
                {...invalid("slug")}
              />
            </div>
            {err("slug")}
          </div>
          <div>
            <label htmlFor="s-role" className={field.label}>
              Role
            </label>
            <input
              id="s-role"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Staff Writer"
              className={field.input}
              {...invalid("role")}
            />
            {err("role")}
          </div>
          <div>
            <label htmlFor="s-group" className={field.label}>
              Group on the team page
            </label>
            <select
              id="s-group"
              value={form.role_group}
              onChange={(e) => update("role_group", e.target.value)}
              className={field.select}
              {...invalid("role_group")}
            >
              {ROLE_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {err("role_group")}
          </div>
          <div>
            <label htmlFor="s-grade" className={field.label}>
              Grade
            </label>
            <input
              id="s-grade"
              value={form.grade}
              onChange={(e) => update("grade", e.target.value)}
              placeholder="Grade 11"
              className={field.input}
            />
          </div>
          <div>
            <label htmlFor="s-ig" className={field.label}>
              Instagram handle
            </label>
            <input
              id="s-ig"
              value={form.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="aisr.press"
              className={field.input}
              {...invalid("instagram")}
            />
            {err("instagram")}
          </div>
        </div>

        <div>
          <label htmlFor="s-bio" className={field.label}>
            Bio
          </label>
          <textarea
            id="s-bio"
            rows={5}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Two or three sentences in the third person: what they cover, what they like writing about."
            className={`${field.input} resize-y font-serif text-[17px] leading-relaxed`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="s-order" className={field.label}>
              Order on the team page
            </label>
            <input
              id="s-order"
              type="number"
              min={0}
              max={9999}
              value={Number.isFinite(form.sort_order) ? form.sort_order : ""}
              onChange={(e) => update("sort_order", e.target.valueAsNumber)}
              className={field.input}
              aria-describedby={errors.sort_order ? "err-sort_order order-hint" : "order-hint"}
              aria-invalid={Boolean(errors.sort_order)}
            />
            <p id="order-hint" className={field.hint}>
              Lower numbers appear first within a group.
            </p>
            {err("sort_order")}
          </div>
          <label className="flex cursor-pointer gap-3 self-start pt-6">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-navy"
            />
            <span>
              <span className="block font-sans text-[14px] font-semibold text-ink">Active</span>
              <span className="block font-sans text-[13px] leading-snug text-ink-soft">
                Inactive members are hidden everywhere on the site, including bylines, until you tick this again.
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink pt-5">
          <button type="submit" className={btn.primary} disabled={saving}>
            {saving ? "Saving..." : form.id ? "Save changes" : "Add to the team"}
          </button>
          {form.id ? (
            <ConfirmButton
              label="Delete"
              title={`Delete ${initial.name}?`}
              redirectTo="/dashboard/team"
              action={() => deleteStaff(form.id!)}
            >
              <p>
                Their profile and author page are removed.
                {articleCount
                  ? ` Their name also comes off the byline of ${articleCount} ${articleCount === 1 ? "article" : "articles"}; the articles stay.`
                  : ""}{" "}
                To hide them without deleting anything, untick Active instead. This cannot be undone.
              </p>
            </ConfirmButton>
          ) : null}
          <span className="font-sans text-[13px] text-ink-soft" aria-live="polite">
            {dirty ? "Unsaved changes" : ""}
          </span>
        </div>
      </div>
    </form>
  );
}
