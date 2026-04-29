import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();
  type CookieOptions = Parameters<typeof cookieStore.set>[2];
  type CookieToSet = { name: string; value: string; options?: CookieOptions };

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookies can't be set.
            // Middleware handles session refresh instead.
          }
        },
      },
    }
  );
}

/**
 * Get the currently authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
