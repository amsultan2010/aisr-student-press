"use server";

import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type DevSignInState = { error: string | null };

// Local testing only. The form that calls this is not rendered in production,
// and the action refuses to run there even if called directly.
export async function devSignIn(_prev: DevSignInState, formData: FormData): Promise<DevSignInState> {
  if (process.env.NODE_ENV !== "development") return { error: "Password sign-in is only available in development." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter an email and a password." };

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
