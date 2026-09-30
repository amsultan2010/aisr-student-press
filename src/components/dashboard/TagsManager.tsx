"use client";

import { useState, useTransition } from "react";
import { createTag, deleteTag, renameTag } from "@/lib/dashboard/tags";
import { ConfirmButton } from "./ConfirmButton";
import { btn, EmptyState, field } from "./ui";

type Row = { id: string; name: string; slug: string; count: number };

function TagRow({ tag }: { tag: Row }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await renameTag(tag.id, name);
      if (!res.ok) return setError(res.error);
      setError(null);
      setEditing(false);
    });
  }

  return (
    <li className="grid gap-x-6 gap-y-2 border-b border-rule py-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto] sm:items-center">
      {editing ? (
        <div className="min-w-0">
          <label htmlFor={`tag-${tag.id}`} className="sr-only">
            New name for {tag.name}
          </label>
          <input
            id={`tag-${tag.id}`}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setEditing(false);
                setName(tag.name);
                setError(null);
              }
            }}
            className={`${field.input} mt-0`}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p role="alert" className={field.error}>
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="min-w-0">
          <a
            href={`/tag/${tag.slug}`}
            target="_blank"
            rel="noopener"
            className="font-serif text-lg text-ink decoration-rule underline-offset-4 hover:underline"
          >
            {tag.name}
            <span className="sr-only"> (opens the tag page in a new tab)</span>
          </a>
          <p className="font-sans text-[12px] text-ink-soft">/tag/{tag.slug}</p>
        </div>
      )}
      <p className="font-sans text-sm tabular-nums text-ink-soft">
        {tag.count} {tag.count === 1 ? "article" : "articles"}
      </p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {editing ? (
          <>
            <button type="button" className={btn.primary} onClick={save} disabled={pending || !name.trim()}>
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className={btn.quiet}
              onClick={() => {
                setEditing(false);
                setName(tag.name);
                setError(null);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btn.quiet} onClick={() => setEditing(true)}>
              Rename
            </button>
            <ConfirmButton label="Delete" title={`Delete the tag "${tag.name}"?`} action={deleteTag.bind(null, tag.id)}>
              <p>
                {tag.count
                  ? `It will be removed from ${tag.count} ${tag.count === 1 ? "article" : "articles"}. The articles themselves stay.`
                  : "No articles use it."}{" "}
                The tag page at /tag/{tag.slug} will stop working.
              </p>
            </ConfirmButton>
          </>
        )}
      </div>
    </li>
  );
}

export function TagsManager({ tags }: { tags: Row[] }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function create(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createTag(name);
      if (!res.ok) return setMessage({ tone: "error", text: res.error });
      setMessage({
        tone: "ok",
        text: res.existed ? `"${res.tag.name}" already exists.` : `Added "${res.tag.name}".`,
      });
      setName("");
    });
  }

  return (
    <>
      <form onSubmit={create} className="mb-8 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="new-tag" className={field.label}>
            New tag
          </label>
          <input
            id="new-tag"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="For example Model UN"
            className={`${field.input} h-11`}
            aria-describedby="new-tag-msg"
          />
        </div>
        <button type="submit" className={`${btn.primary} h-11`} disabled={pending || !name.trim()}>
          {pending ? "Adding..." : "Add tag"}
        </button>
        <p id="new-tag-msg" role="status" className={`w-full ${message?.tone === "error" ? field.error : field.hint}`}>
          {message?.text ?? "Tags group stories across sections. Each one gets its own page on the site."}
        </p>
      </form>

      {tags.length ? (
        <ul className="border-t border-ink">
          {tags.map((t) => (
            <TagRow key={`${t.id}-${t.name}`} tag={t} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No tags yet">Add one above, or create tags while writing an article.</EmptyState>
      )}
    </>
  );
}
