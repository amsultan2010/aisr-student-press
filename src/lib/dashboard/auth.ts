import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";

// One allowlist lookup per request, shared by the layout and the page.
export const currentAdmin = cache(getAdmin);

// For dashboard pages. Signed-out visitors and signed-in non-editors both go to
// /login, which shows the sign-in form or the "no access" screen.
export async function requireAdmin() {
  const { supabase, user, isAdmin } = await currentAdmin();
  if (!user || !isAdmin) redirect("/login");
  return { supabase, user };
}

// For server actions: they are reachable by direct POST, so each one checks
// again and returns null instead of redirecting.
export async function adminForAction() {
  const { supabase, user, isAdmin } = await getAdmin();
  if (!user || !isAdmin) return null;
  return { supabase, user };
}

export const NOT_ALLOWED = "Your account is not on the editors list, so this change was not saved.";
