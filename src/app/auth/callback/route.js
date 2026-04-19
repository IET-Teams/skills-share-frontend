import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(code, error);

    if (!error) {
      const cookieStore = await cookies();
      const next = cookieStore.get("next_url")?.value || "/dashboard";
      cookieStore.delete("next_url");

      return NextResponse.redirect(`${origin}${next}`); // Your protected route
    }
  }

  // Redirect to error page if login fails
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
