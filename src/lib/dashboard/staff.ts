"use server";

import { revalidatePath } from "next/cache";
import { adminForAction, NOT_ALLOWED } from "./auth";
import { isAllowedImageUrl, removeMedia } from "./storage";
import { ROLE_GROUPS, SLUG_PATTERN, type ActionResult, type StaffInput } from "./types";

export async function saveStaff(input: StaffInput): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase } = admin;

  const name = String(input.name ?? "").trim();
  const slug = String(input.slug ?? "").trim();
  const role = String(input.role ?? "").trim();
  const photoUrl = typeof input.photo_url === "string" ? input.photo_url.trim() || null : null;
  const instagram = String(input.instagram ?? "").trim().replace(/^@/, "");
  const sortOrder = Number(input.sort_order);
  const fields: Record<string, string> = {};

  if (!name) fields.name = "Add a name.";
  else if (name.length > 120) fields.name = "Keep the name under 120 characters.";
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) fields.slug = "Use lowercase letters, numbers and single hyphens.";
  if (!role) fields.role = "Add a role, for example Staff Writer.";
  if (!ROLE_GROUPS.some((g) => g.value === input.role_group)) fields.role_group = "Pick a group.";
  if (photoUrl && !isAllowedImageUrl(photoUrl)) fields.photo = "Upload the photo here instead of linking to it.";
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) fields.instagram = "Use the handle only, for example aisr.press.";
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) fields.sort_order = "Use a whole number from 0 to 9999.";
  if (Object.keys(fields).length) return { ok: false, error: "Some fields need attention before this can be saved.", fields };

  const row = {
    name,
    slug,
    role,
    role_group: input.role_group,
    bio: String(input.bio ?? "").trim(),
    grade: String(input.grade ?? "").trim() || null,
    instagram: instagram || null,
    photo_url: photoUrl,
    is_active: input.is_active === true,
    sort_order: sortOrder,
  };

  let previousPhoto: string | null = null;
  if (input.id) {
    const { data } = await supabase.from("staff").select("photo_url").eq("id", input.id).maybeSingle();
    previousPhoto = data?.photo_url ?? null;
  }

  const saved = input.id
    ? await supabase.from("staff").update(row).eq("id", input.id).select("id").single()
    : await supabase.from("staff").insert(row).select("id").single();
  if (saved.error?.code === "23505") {
    return { ok: false, error: "Another team member already uses this address.", fields: { slug: "Taken" } };
  }
  if (saved.error) return { ok: false, error: saved.error.message };
  if (previousPhoto && previousPhoto !== photoUrl) await removeMedia(supabase, [previousPhoto]);

  revalidatePath("/", "layout");
  return { ok: true, id: saved.data.id };
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase } = admin;

  const { data: existing } = await supabase.from("staff").select("photo_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (existing) await removeMedia(supabase, [existing.photo_url]);

  revalidatePath("/", "layout");
  return { ok: true };
}
