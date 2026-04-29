import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ResponseCookieOptions = Parameters<NextResponse["cookies"]["set"]>[2];
type CookieToSet = { name: string; value: string; options?: ResponseCookieOptions };

export async function createRouteClient() {
  const cookieStore = await cookies();
  const pendingCookies: CookieToSet[] = [];

  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  function applyCookies(response: NextResponse) {
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  }

  return { supabase, applyCookies };
}
