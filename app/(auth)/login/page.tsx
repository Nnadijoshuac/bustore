"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { APP_SESSION_COOKIE, APP_SESSION_MAX_AGE, APP_USER_EMAIL_COOKIE, APP_USER_NAME_COOKIE } from "@/lib/auth/session";
import { deriveFullName, storeLoginIdentity } from "@/lib/auth/identity";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
      setLoading(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.session || !data.user) {
        setError("Sign in did not create a session.");
        return;
      }

      const resolvedEmail = data.user.email ?? parsed.data.email;
      const resolvedName =
        (typeof data.user.user_metadata.full_name === "string" && data.user.user_metadata.full_name) ||
        deriveFullName(resolvedEmail);

      document.cookie = `${APP_SESSION_COOKIE}=1; Path=/; Max-Age=${APP_SESSION_MAX_AGE}; SameSite=Lax`;
      document.cookie = `${APP_USER_EMAIL_COOKIE}=${encodeURIComponent(resolvedEmail)}; Path=/; Max-Age=${APP_SESSION_MAX_AGE}; SameSite=Lax`;
      document.cookie = `${APP_USER_NAME_COOKIE}=${encodeURIComponent(resolvedName)}; Path=/; Max-Age=${APP_SESSION_MAX_AGE}; SameSite=Lax`;
      storeLoginIdentity({ email: resolvedEmail, full_name: resolvedName });
    } catch {
      setLoading(false);
      setError("Unable to reach the login service. Check your connection and try again.");
      return;
    }

    window.location.assign("/overview");
  };

  return (
    <div className="w-full max-w-[440px] rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/logo_fluent.png"
          alt="Fluent logo"
          width={200}
          height={134}
          priority
          sizes="200px"
          className="h-14 w-auto object-contain"
        />
        <div>
          <p className="font-display text-xl font-bold">Fluent</p>
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight text-busha-slate">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in with your real account to access your workspace immediately.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="input-base pl-10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="input-base pl-10"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3 text-base">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-primary">
          Create one
        </Link>
      </p>

      <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-busha-slate/70">
        Back to product overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
