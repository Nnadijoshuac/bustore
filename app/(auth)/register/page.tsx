"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Globe2, LockKeyhole, Mail, UserRound } from "lucide-react";

const countries = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push("/overview");
  };

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/logo_fluent.png"
          alt="Fluent logo"
          width={150}
          height={100}
          priority
          sizes="150px"
          className="h-11 w-auto object-contain"
        />
        <div>
          <p className="font-display text-xl font-bold">Fluent</p>
          <p className="text-xs text-muted-foreground">Demo onboarding</p>
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
              <input type="text" placeholder="Nnadi Joshua" className="input-base pl-10" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" placeholder="you@business.com" className="input-base pl-10" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Business Name</label>
            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Your Studio" className="input-base pl-10" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Country</label>
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select className="input-base bg-background pl-10">
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
              <input type="password" placeholder="Min. 8 characters" className="input-base pl-10" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3 text-base">
          {loading ? "Creating workspace..." : "Create account"}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-border bg-secondary/60 px-4 py-3">
        <p className="text-sm font-medium text-busha-slate">What you can test immediately</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a payment link, start a Busha payment request, inspect recipients, and view webhook activity.
        </p>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-busha-slate/70 hover:text-busha-slate">
        Back to product overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
