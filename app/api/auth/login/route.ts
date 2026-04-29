import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { loginSchema } from "@/lib/validations";

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to sign in.";
  }

  const message = error.message.toLowerCase();
  if (message.includes("fetch failed") || message.includes("failed to fetch")) {
    return "Authentication service is unreachable. Check NEXT_PUBLIC_SUPABASE_URL and your network DNS.";
  }

  if (message.includes("enotfound") || message.includes("could not resolve host")) {
    return "Supabase host could not be resolved. Check NEXT_PUBLIC_SUPABASE_URL.";
  }

  return error.message;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid login details." },
        { status: 400 }
      );
    }

    const { supabase, applyCookies } = await createRouteClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return applyCookies(NextResponse.json({ error: error.message }, { status: 401 }));
    }

    if (!data.session || !data.user) {
      return applyCookies(
        NextResponse.json({ error: "Sign in did not create a session." }, { status: 401 })
      );
    }

    return applyCookies(
      NextResponse.json({ ok: true, user: { id: data.user.id, email: data.user.email } })
    );
  } catch (error) {
    const message = getAuthErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
