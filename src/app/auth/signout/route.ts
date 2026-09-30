import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";

// POST only, so a prefetch or a stray link can never sign someone out. Forms
// post here as a full page navigation, which also clears the client cache.
export async function POST(request: NextRequest) {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
