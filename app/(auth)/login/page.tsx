"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/overview");
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-xl">Fluent</span>
      </div>
      <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
      <p className="text-muted-foreground text-sm mb-6">Sign in to your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input type="email" defaultValue="ade@adebayodesigns.com" className="input-base" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Password</label>
          <input type="password" defaultValue="demo1234" className="input-base" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        No account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
      </p>
      <p className="text-center text-xs text-muted-foreground mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
        🧪 Demo mode — use any credentials
      </p>
    </div>
  );
}
