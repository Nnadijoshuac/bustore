"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
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
      <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
      <p className="text-muted-foreground text-sm mb-6">Start receiving global payments today</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Full Name</label>
            <input type="text" placeholder="Nnadi Joshua" className="input-base" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input type="email" placeholder="you@business.com" className="input-base" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Business Name (optional)</label>
            <input type="text" placeholder="Your Studio" className="input-base" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Country</label>
            <select className="input-base bg-background">
              <option value="NG">🇳🇬 Nigeria</option>
              <option value="GH">🇬🇭 Ghana</option>
              <option value="KE">🇰🇪 Kenya</option>
              <option value="ZA">🇿🇦 South Africa</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input type="password" placeholder="Min. 8 characters" className="input-base" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
