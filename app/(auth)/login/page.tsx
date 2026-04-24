"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/overview");
  };

  return (
    <div className="w-full max-w-[440px] rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-8">
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
          <p className="text-xs text-muted-foreground">Demo login</p>
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight text-busha-slate">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in to explore the demo workspace and test the payment request flow.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="email" defaultValue="ade@adebayodesigns.com" className="input-base pl-10" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="password" defaultValue="demo1234" className="input-base pl-10" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3 text-base">
          {loading ? "Signing in..." : "Enter demo workspace"}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Demo mode is enabled. Any credentials will continue to the product walkthrough.
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>

      <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-busha-slate/70 hover:text-busha-slate">
        Back to product overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
