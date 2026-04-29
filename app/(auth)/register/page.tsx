"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Globe2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { registerSchema } from "@/lib/validations";

const countries = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    email: "",
    country: countries[0]?.value ?? "NG",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your details and try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as {
        error?: string;
        hasSession?: boolean;
        needsConfirmation?: boolean;
      };

      setLoading(false);

      if (!response.ok) {
        setError(result.error || "Unable to create account.");
        return;
      }

      if (result.hasSession) {
        router.replace("/overview");
        router.refresh();
        return;
      }

      if (result.needsConfirmation) {
        setMessage("Account created. Check your email to confirm your account, then sign in.");
        return;
      }
    } catch {
      setLoading(false);
      setError("Unable to reach the signup service. Check your connection and try again.");
      return;
    }

  };

  return (
    <div className="w-full max-w-[540px] rounded-[3rem] border border-white/70 bg-white/92 p-6 shadow-2xl shadow-slate-200/70 sm:p-10 lg:mr-auto">
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

      <h1 className="font-display text-3xl font-bold tracking-tight text-busha-slate">Create your workspace</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Set up a lightweight operations account for links, requests, recipients, and payouts.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.full_name}
                onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                placeholder="Joshua Serenity Nnadi"
                className="input-base pl-10"
              />
            </div>
          </div>



          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Business Name</label>
            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.business_name}
                onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))}
                placeholder="Your Studio"
                className="input-base pl-10"
              />
            </div>
          </div>


          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                placeholder="serenity@business.com"
                className="input-base pl-10"
              />
            </div>
          </div>



          <div>
            <label className="mb-1.5 block text-sm font-medium">Country</label>
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={form.country}
                onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                className="input-base bg-background pl-10"
              >
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="input-base pl-10"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3 text-base">
          {loading ? "Creating workspace..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>

      <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-busha-slate/70">
        Back to product overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
