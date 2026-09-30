import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";

// Only same-site paths, so the callback cannot be used as an open redirect.
function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  return next;
}

function loginWithError(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));

  // Google or Supabase can send the visitor back with an error instead of a code.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return loginWithError(request, providerError);

  const code = searchParams.get("code");
  if (!code) return loginWithError(request, "The sign-in link was missing its code. Please try again.");

  const supabase = await serverClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return loginWithError(request, error.message);

  return NextResponse.redirect(new URL(next, request.url));
}
