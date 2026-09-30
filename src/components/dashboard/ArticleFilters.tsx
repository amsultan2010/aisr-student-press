"use client";

import Form from "next/form";
import { SECTIONS } from "@/lib/site";
import { btn, field } from "./ui";

// GET form, so filters live in the URL. Selects apply as soon as they change;
// the search box applies on Enter or the button.
export function ArticleFilters({ q, section, status, sort }: { q: string; section: string; status: string; sort: string }) {
  const submitOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

  return (
    <Form
      action="/dashboard/articles"
      className="mb-6 grid grid-cols-2 items-end gap-3 border-b border-rule pb-6 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]"
    >
      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="f-q" className={field.label}>
          Search
        </label>
        <input id="f-q" name="q" type="search" defaultValue={q} placeholder="Headline, summary or address" className={`${field.input} h-11`} />
      </div>
      <div>
        <label htmlFor="f-section" className={field.label}>
          Section
        </label>
        <select id="f-section" name="section" defaultValue={section} onChange={submitOnChange} className={`${field.select} h-11`}>
          <option value="">All sections</option>
          {SECTIONS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-status" className={field.label}>
          Status
        </label>
        <select id="f-status" name="status" defaultValue={status} onChange={submitOnChange} className={`${field.select} h-11`}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-sort" className={field.label}>
          Sort
        </label>
        <select id="f-sort" name="sort" defaultValue={sort} onChange={submitOnChange} className={`${field.select} h-11`}>
          <option value="">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="views">Most views</option>
          <option value="title">Headline A to Z</option>
        </select>
      </div>
      <button type="submit" className={`${btn.secondary} h-11`}>
        Apply
      </button>
    </Form>
  );
}
