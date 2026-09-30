import "server-only";
import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { articleExtensions } from "./extensions";

// Renders stored Tiptap JSON to HTML. Only nodes and marks in the schema are
// emitted, so arbitrary HTML cannot be injected through the body field.
export function renderArticleBody(body: unknown) {
  const doc = body as JSONContent;
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return "";
  return generateHTML(doc, articleExtensions);
}

// Plain text for search, reading time and meta descriptions.
export function bodyToText(body: unknown): string {
  const out: string[] = [];
  const walk = (node: JSONContent) => {
    if (node.text) out.push(node.text);
    node.content?.forEach(walk);
  };
  walk(body as JSONContent);
  return out.join(" ").replace(/\s+/g, " ").trim();
}
