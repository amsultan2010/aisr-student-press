"use server";

import { revalidatePath } from "next/cache";
import { adminForAction, NOT_ALLOWED } from "./auth";
import type { ActionResult } from "./types";

const STATUSES = ["new", "read", "archived"] as const;

export async function setSubmissionStatus(id: string, status: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const next = STATUSES.find((s) => s === status);
  if (!next) return { ok: false, error: "Unknown status." };

  const { error } = await admin.supabase.from("submissions").update({ status: next }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { supabase } = admin;

  const { data: existing } = await supabase.from("submissions").select("attachment_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (existing?.attachment_path) await supabase.storage.from("submissions").remove([existing.attachment_path]);

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
