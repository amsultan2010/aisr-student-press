"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";
import { adminForAction, NOT_ALLOWED } from "./auth";
import type { ActionResult } from "./types";

export type Tag = { id: string; name: string; slug: string };
export type TagResult = { ok: true; tag: Tag; existed: boolean } | { ok: false; error: string };

// Returns the existing tag when one with the same slug is already there, so
// the editor's inline "create" never fails on a near-duplicate.
export async function createTag(rawName: string): Promise<TagResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
  const slug = slugify(name);
  if (!name || !slug) return { ok: false, error: "Tag names need at least one letter or number." };
  if (name.length > 60) return { ok: false, error: "Keep tag names under 60 characters." };

  const { supabase } = admin;
  const { data: existing } = await supabase.from("tags").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (existing) return { ok: true, tag: existing, existed: true };

  const { data, error } = await supabase.from("tags").insert({ name, slug }).select("id, name, slug").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, tag: data, existed: false };
}

// Renaming also moves the tag page to the new slug.
export async function renameTag(id: string, rawName: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
  const slug = slugify(name);
  if (!name || !slug) return { ok: false, error: "Tag names need at least one letter or number." };
  if (name.length > 60) return { ok: false, error: "Keep tag names under 60 characters." };

  const { error } = await admin.supabase.from("tags").update({ name, slug }).eq("id", id);
  if (error?.code === "23505") return { ok: false, error: `Another tag already uses the address /tag/${slug}.` };
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { error } = await admin.supabase.from("tags").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
