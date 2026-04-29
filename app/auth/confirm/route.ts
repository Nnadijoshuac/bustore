import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { APP_SESSION_COOKIE, APP_SESSION_MAX_AGE, APP_USER_EMAIL_COOKIE, APP_USER_NAME_COOKIE } from "@/lib/auth/session";
import { deriveFullName } from "@/lib/auth/identity";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination = next && next.startsWith("/") ? next : "/overview";
  const redirectUrl = new URL(destination, url.origin);

  if (!code) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "missing_confirmation_code");
    return NextResponse.redirect(redirectUrl);
  }

  const { supabase, applyCookies } = await createRouteClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "confirmation_failed");
    return applyCookies(NextResponse.redirect(loginUrl));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(APP_SESSION_COOKIE, "1", {
    path: "/",
    maxAge: APP_SESSION_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  response.cookies.set(APP_USER_EMAIL_COOKIE, encodeURIComponent(user?.email ?? ""), {
    path: "/",
    maxAge: APP_SESSION_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  response.cookies.set(
    APP_USER_NAME_COOKIE,
    encodeURIComponent(
      (typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name) ||
        deriveFullName(user?.email ?? "")
    ),
    {
      path: "/",
      maxAge: APP_SESSION_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    }
  );

  return applyCookies(response);
}
