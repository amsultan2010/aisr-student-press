"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import { articleExtensions } from "@/lib/editor/extensions";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/dashboard/upload";
import { btn, field } from "./ui";

// Styles the editing surface like the published article body.
const PROSE = [
  "min-h-[26rem] px-5 py-5 font-serif text-[19px] leading-[1.6] text-ink outline-none sm:px-8",
  "[&>*:first-child]:mt-0 [&_p]:my-4",
  "[&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-[1.75rem] [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:tracking-[-0.015em]",
  "[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-[1.35rem] [&_h3]:font-semibold [&_h3]:leading-snug",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li_p]:my-1",
  "[&_blockquote]:my-8 [&_blockquote]:border-y [&_blockquote]:border-gold [&_blockquote]:py-4 [&_blockquote]:text-[1.6rem] [&_blockquote]:italic [&_blockquote]:leading-snug [&_blockquote]:text-navy [&_blockquote_p]:my-0",
  "[&_a]:text-navy [&_a]:underline [&_a]:underline-offset-4",
  "[&_hr]:my-10 [&_hr]:border-rule",
  "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-gold",
].join(" ");

function normaliseUrl(raw: string) {
  const url = raw.trim();
  if (!url) return "";
  if (/^(https?:|mailto:)/i.test(url) || url.startsWith("/")) return url;
  if (/^[\w-]+(\.[\w-]+)+/.test(url)) return `https://${url}`;
  return "";
}

function ToolButton({
  label,
  active,
  onClick,
  disabled,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 min-w-9 place-items-center px-2 font-sans text-[14px] transition-colors active:translate-y-px disabled:opacity-40 ${
        active ? "bg-navy text-cream" : "text-ink hover:bg-paper-2"
      }`}
    >
      {children}
    </button>
  );
}

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d={d} />
  </svg>
);

export function RichText({
  initial,
  onChange,
  error,
  describedBy,
}: {
  initial: unknown;
  onChange: (doc: JSONContent) => void;
  error?: string;
  describedBy?: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [pendingImage, setPendingImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const doc = initial as JSONContent | null;
  const editor = useEditor({
    extensions: articleExtensions,
    content: doc?.type === "doc" && doc.content?.length ? doc : { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: PROSE,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Article body",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            link: e.isActive("link"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
          }
        : null,
  });

  function openLink() {
    if (!editor) return;
    setLinkValue((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = normaliseUrl(linkValue);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLinkOpen(false);
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setImageBusy(true);
    setImageError(null);
    try {
      setPendingImage({ src: await uploadImage(file, "body"), alt: "" });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setImageBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function insertImage() {
    if (!editor || !pendingImage || !pendingImage.alt.trim()) return;
    editor.chain().focus().setImage({ src: pendingImage.src, alt: pendingImage.alt.trim() }).run();
    setPendingImage(null);
  }

  const off = !editor;

  return (
    <div
      className={`border bg-cream transition-colors focus-within:border-navy ${error ? "border-l-4 border-ink" : "border-rule"}`}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-rule bg-cream px-2 py-1.5"
      >
        <ToolButton label="Bold" active={s?.bold} disabled={off} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolButton>
        <ToolButton label="Italic" active={s?.italic} disabled={off} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <span className="font-serif italic">I</span>
        </ToolButton>
        <ToolButton
          label="Underline"
          active={s?.underline}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <span className="underline underline-offset-2">U</span>
        </ToolButton>
        <ToolButton label="Link" active={s?.link || linkOpen} disabled={off} onClick={openLink}>
          <Icon d="M7.5 10.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M10.5 7.5a3 3 0 0 0-4.2 0L3.7 10.1a3 3 0 0 0 4.2 4.2l.8-.8" />
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-rule" />
        <ToolButton
          label="Heading"
          active={s?.h2}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="font-semibold">H2</span>
        </ToolButton>
        <ToolButton
          label="Subheading"
          active={s?.h3}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="font-semibold">H3</span>
        </ToolButton>
        <ToolButton
          label="Bulleted list"
          active={s?.bullet}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <Icon d="M7 4.5h8M7 9h8M7 13.5h8M3.5 4.5h.01M3.5 9h.01M3.5 13.5h.01" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          active={s?.ordered}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <Icon d="M7.5 4.5h7.5M7.5 9h7.5M7.5 13.5h7.5M3 3.5l1-.5v3M3 8h2L3 10.5h2M3 12.5h2l-1 1 1 1H3" />
        </ToolButton>
        <ToolButton
          label="Pull quote"
          active={s?.quote}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <span className="font-serif text-xl leading-none">&ldquo;</span>
        </ToolButton>
        <ToolButton label="Divider" disabled={off} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <Icon d="M2.5 9h13" />
        </ToolButton>
        <ToolButton label="Insert image" disabled={off || imageBusy} onClick={() => fileInput.current?.click()}>
          <Icon d="M2.5 3.5h13v11h-13zM2.5 12l4-4 3.5 3.5 2-2 3.5 3.5M11.5 6.5h.01" />
        </ToolButton>
        {imageBusy ? <span className="px-2 font-sans text-[12px] text-ink-soft">Uploading image...</span> : null}
      </div>

      {linkOpen ? (
        <div className="flex flex-wrap items-end gap-2 border-b border-rule bg-paper-2 px-3 py-3">
          <label className="min-w-0 flex-1">
            <span className={field.label}>Link address</span>
            <input
              autoFocus
              type="url"
              inputMode="url"
              placeholder="https://"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") setLinkOpen(false);
              }}
              className={field.input}
            />
          </label>
          <button type="button" className={btn.primary} onClick={applyLink}>
            {linkValue.trim() ? "Apply" : "Remove link"}
          </button>
          <button type="button" className={btn.secondary} onClick={() => setLinkOpen(false)}>
            Cancel
          </button>
        </div>
      ) : null}

      {pendingImage ? (
        <div className="flex flex-wrap items-end gap-2 border-b border-rule bg-paper-2 px-3 py-3">
          <label className="min-w-0 flex-1">
            <span className={field.label}>Describe this image for screen readers (required)</span>
            <input
              autoFocus
              value={pendingImage.alt}
              onChange={(e) => setPendingImage({ ...pendingImage, alt: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertImage();
                }
              }}
              className={field.input}
            />
          </label>
          <button type="button" className={btn.primary} onClick={insertImage} disabled={!pendingImage.alt.trim()}>
            Insert image
          </button>
          <button type="button" className={btn.secondary} onClick={() => setPendingImage(null)}>
            Cancel
          </button>
        </div>
      ) : null}
      {imageError ? (
        <p role="alert" className="border-b border-rule bg-gold-soft/60 px-4 py-2 font-sans text-sm text-ink">
          {imageError}
        </p>
      ) : null}

      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose an image to insert"
        onChange={(e) => onImage(e.target.files?.[0])}
      />
      {editor ? <EditorContent editor={editor} /> : <div className={`${PROSE} text-ink-soft`}>Loading the editor...</div>}
    </div>
  );
}
