"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Zap, Globe, BarChart3, Link2, Users, CreditCard } from "lucide-react";

/* ─── DATA ──────────────────────────────────────────────────── */

const features = [
  {
    icon: Link2,
    title: "Payment Links",
    description: "Create polished, branded payment links for invoices, retainers, and project milestones in seconds.",
  },
  {
    icon: Zap,
    title: "AI-Powered Copywriting",
    description: "Describe your service in plain language. Fluent AI writes the perfect title and description for your payment link.",
  },
  {
    icon: Globe,
    title: "Live Busha Pay Flow",
    description: "When a client opens your link, Fluent triggers a live Busha payment request — returning real QR codes, wallet addresses, and live status.",
  },
  {
    icon: BarChart3,
    title: "AI Business Insights",
    description: "Your dashboard surfaces AI-generated insights about your revenue trends, customer behaviour, and collection health.",
  },
  {
    icon: Users,
    title: "Customer & Recipient Hub",
    description: "Onboard, verify, and manage customers and payout recipients from a single, clean workspace.",
  },
];

const steps = [
  { step: "01", title: "Create a payment link", body: "Give it a name, amount, and currency. Or let Fluent AI write the copy from your rough notes." },
  { step: "02", title: "Share it with your client", body: "Send the link via WhatsApp, email, or invoice. No account needed on their end." },
  { step: "03", title: "Client initiates checkout", body: "Fluent generates a live Busha payment request the moment they hit \"Pay Now\"." },
  { step: "04", title: "Get paid. Track it all.", body: "See settlement status, transaction history, and AI insights — all in one dashboard." },
];

const audiences = [
  { label: "Freelancers", desc: "Brand designers, developers, copywriters — anyone billing clients globally." },
  { label: "Lean Agencies", desc: "Small teams that need a clean payment stack without a full Stripe setup." },
  { label: "Creators", desc: "Coaches, educators, and digital product sellers collecting from anywhere." },
  { label: "African Businesses", desc: "Any business that wants to collect globally and settle locally in crypto or fiat." },
];

const stats = [
  { value: "2 min", label: "Average link creation time" },
  { value: "190+", label: "Countries your clients can pay from" },
  { value: "100%", label: "Busha-powered, real-time settlement" },
  { value: "very low", label: " Fees" },
];

/* ─── COMPONENTS ─────────────────────────────────────────────── */

function NavBar() {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-5 py-3 shadow-lg shadow-slate-900/5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo_fluent.png" alt="Fluent" width={120} height={40} className="h-8 w-auto object-contain" priority />
          <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-slate-900">Fluent</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 sm:inline-flex">
            Sign in
          </Link>
          <Link href="/register" className="inline-flex items-center gap-1.5 rounded-full bg-[#00C896] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white">
            Get started <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Powered by</span>
            <Image src="/busha_logo.png" alt="Busha" width={80} height={24} className="h-6 w-auto object-contain" unoptimized />
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.36em] text-[#00C896]">
            Global client payments for African businesses
          </p>
          <h1 className="font-display text-5xl font-bold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[5.5rem]">
            The payment workspace<br />
            <span className="bg-gradient-to-r from-[#00C896] to-[#00A87E] bg-clip-text text-transparent">
              African businesses
            </span>{" "}
            deserve.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
            Send a polished payment link. Your client pays in seconds. You collect globally — and settle locally — through Busha&rsquo;s live payment infrastructure.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.22em] text-white">
            Launch your workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/overview" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.22em] text-slate-700">
            View live demo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Trust pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[11px] font-semibold text-slate-400">
          {["No Fluent fees", "Real Busha payments", "AI-powered", "Crypto & stablecoin"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-[#00C896]" /> {t}
            </span>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-[0_60px_160px_rgba(15,23,42,0.25)]">
            {/* Mock dashboard */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <div className="ml-3 flex-1 rounded-full bg-white/5 px-4 py-1 text-[10px] text-white/30">https://bushafluent.vercel.app/overview</div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Gross Volume", val: "$24,850", up: true },
                { label: "In Transit", val: "$3,200", up: false },
                { label: "Active Links", val: "12", up: true },
                { label: "Customers", val: "48", up: true },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/35">{s.label}</p>
                  <p className="mt-2 text-lg font-bold text-white">{s.val}</p>
                  <p className={`mt-1 text-[9px] font-bold ${s.up ? "text-[#00C896]" : "text-amber-400"}`}>
                    {s.up ? "↑ 18% vs last month" : "Processing"}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/8 bg-white/4 p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">Revenue · Last 30 days</p>
              <div className="flex h-20 items-end gap-1.5">
                {[30, 55, 40, 70, 50, 85, 60, 95, 75, 100, 80, 72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-[#00C896]/60" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{s.value}</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#00C896]">Everything you need</p>
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-slate-950 sm:text-5xl">
            A complete payment stack.<br />Zero complexity.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-500">
            Fluent wraps the full Busha API surface in a workspace built for small teams and solo operators.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C896]/10 text-[#00C896]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-display text-base font-bold text-slate-900">{f.title}</h3>
              <p className="text-[13px] leading-6 text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 px-4 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#00C896]">The Fluent flow</p>
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            From link to money in your account.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-white/8 bg-white/4 p-7">
              <p className="font-display text-5xl font-bold text-[#00C896]/30">{s.step}</p>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/55">{s.body}</p>
            </div>
          ))}
        </div>

        {/* AI callout */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#00C896]/20 bg-[#00C896]/8 p-8">
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Image src="/logo_fluent_ai.png" alt="Fluent AI" width={48} height={48} className="h-12 w-auto object-contain" />
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-white">Fluent AI is built in, not bolted on.</h3>
              <p className="mt-1 text-[13px] leading-6 text-white/55">
                AI generates your payment link copy and surfaces business insights directly in your dashboard — no prompts, no plugins.
              </p>
            </div>
            <Link href="/register" className="shrink-0 rounded-full bg-[#00C896] px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white">
              Try it free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section id="who-its-for" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#00C896]">Who it&apos;s for</p>
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-slate-950 sm:text-5xl">
            Built for people who work globally but live in Africa.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{a.label}</h3>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PayFlowPreview() {
  return (
    <section className="bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#00C896]">Public pay page</p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-slate-950">
              Your client&apos;s checkout — polished and instant.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-slate-500">
              When your client opens your payment link, Fluent creates a live Busha payment request on the spot. They see a QR code, wallet address, exact amount, and real-time payment confirmation — all on a branded page with your link&apos;s name.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "QR code & wallet address generated in real time",
                "Live payment status polling — no refresh needed",
                "Supports USDT, BTC, ETH, and local stablecoins",
                "Zero friction — no account required for the payer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13px] font-medium text-slate-600">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00C896]/15 text-[#00C896]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock pay page card */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C896]/10">
                  <CreditCard className="h-5 w-5 text-[#00C896]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment request</p>
                  <p className="text-sm font-bold text-slate-900">Brand Identity Design</p>
                </div>
              </div>
              <div className="mb-5 rounded-xl bg-slate-950 p-5 text-center">
                <div className="mx-auto grid h-28 w-28 grid-cols-7 gap-0.5">
                  {[1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1].map((on, i) => (
                    <div key={i} className={`rounded-sm ${on ? "bg-white" : "bg-transparent"}`} />
                  ))}
                </div>
                <p className="mt-3 text-[9px] font-mono text-white/40">0x7f3a...c4e2</p>
              </div>
              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-400">Amount</span>
                  <span className="font-bold text-slate-900">500 USDT</span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-400">Network</span>
                  <span className="font-bold text-slate-900">Ethereum (ERC-20)</span>
                </div>
                <div className="flex justify-between rounded-lg bg-[#00C896]/8 px-3 py-2">
                  <span className="font-bold text-[#00C896]">Status</span>
                  <span className="flex items-center gap-1.5 font-bold text-[#00C896]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C896]" />
                    Waiting for payment
                  </span>
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] font-semibold text-slate-300">Secured by Busha · Powered by Fluent</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-16 shadow-2xl">
          <div className="relative">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#00C896]">Get started today</p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              Your first payment link takes 2 minutes.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-white/50">
              Open your Fluent workspace, connect your Busha account, and start collecting globally — with zero platform fees from Fluent.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[#00C896] px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-white">
                Launch workspace free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/overview" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-white/70">
                View demo first
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/logo_fluent.png" alt="Fluent" width={80} height={30} className="h-7 w-auto object-contain" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Fluent</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>Powered by</span>
          <Image src="/busha_logo.png" alt="Busha" width={60} height={18} className="h-5 w-auto object-contain" unoptimized />
        </div>
        <p className="text-[11px] font-semibold text-slate-300">© {new Date().getFullYear()} Fluent. Built for Africa.</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 antialiased">
      <NavBar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <PayFlowPreview />
      <WhoItsFor />
      <CTA />
      <Footer />
    </main>
  );
}
