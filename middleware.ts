import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { APP_SESSION_COOKIE } from "@/lib/auth/session";

const PROTECTED_ROUTES = [
  "/overview",
  "/payment-links",
  "/transactions",
  "/customers",
  "/recipients",
  "/settlements",
  "/webhooks",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register", "/confirm", "/auth/confirm"];

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const confirmUrl = request.nextUrl.clone();
    confirmUrl.pathname = "/auth/confirm";
    if (!confirmUrl.searchParams.get("next")) {
      confirmUrl.searchParams.set("next", "/overview");
    }
    return NextResponse.redirect(confirmUrl);
  }

  let supabaseResponse = NextResponse.next({ request });
  type CookieOptions = Parameters<typeof supabaseResponse.cookies.set>[2];
  type CookieToSet = { name: string; value: string; options?: CookieOptions };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not remove this call
  const { data: { user } } = await supabase.auth.getUser();
  const hasFallbackSession = request.cookies.get(APP_SESSION_COOKIE)?.value === "1";

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Unauthenticated user trying to access a protected route
  if (!user && !hasFallbackSession && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirected", "1");
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user trying to access login/register
  if ((user || hasFallbackSession) && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/overview";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
