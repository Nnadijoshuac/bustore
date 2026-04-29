import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { APP_USER_EMAIL_COOKIE, APP_USER_NAME_COOKIE } from "@/lib/auth/session";
import { deriveFullName } from "@/lib/auth/identity";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const fallbackEmail = decodeURIComponent(cookieStore.get(APP_USER_EMAIL_COOKIE)?.value ?? "");
      const fallbackName = decodeURIComponent(cookieStore.get(APP_USER_NAME_COOKIE)?.value ?? "");

      if (!fallbackEmail && !fallbackName) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({
        data: {
          id: "",
          email: fallbackEmail,
          full_name: fallbackName || deriveFullName(fallbackEmail),
          business_name: "",
          country: "",
          avatar_url: null,
          created_at: "",
          kyc_status: "pending",
        },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,business_name,country,avatar_url,created_at,kyc_status")
      .eq("id", user.id)
      .maybeSingle();

    const email = user.email ?? "";
    const metadataName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
    const fullName = profile?.full_name || metadataName || deriveFullName(email);

    return NextResponse.json({
      data: {
        id: user.id,
        email,
        full_name: fullName,
        business_name: profile?.business_name ?? user.user_metadata.business_name ?? "",
        country: profile?.country ?? user.user_metadata.country ?? "",
        avatar_url: profile?.avatar_url ?? null,
        created_at: profile?.created_at ?? user.created_at ?? "",
        kyc_status: profile?.kyc_status ?? "pending",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load current user." },
      { status: 500 }
    );
  }
}
