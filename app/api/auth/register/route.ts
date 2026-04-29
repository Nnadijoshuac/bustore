import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { registerSchema } from "@/lib/validations";

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to create account.";
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
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration details." },
        { status: 400 }
      );
    }

    const { supabase, applyCookies } = await createRouteClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${appUrl}/auth/confirm?next=%2Foverview`,
        data: {
          full_name: parsed.data.full_name,
          business_name: parsed.data.business_name || null,
          country: parsed.data.country,
        },
      },
    });

    if (error) {
      return applyCookies(NextResponse.json({ error: error.message }, { status: 400 }));
    }

    return applyCookies(
      NextResponse.json({
        ok: true,
        hasSession: Boolean(data.session),
        needsConfirmation: !data.session,
      })
    );
  } catch (error) {
    const message = getAuthErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
