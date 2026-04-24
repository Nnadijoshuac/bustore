"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Link2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const features = [
  {
    title: "Share payment links fast",
    description: "Create a link in seconds and send it to clients without asking them to sign up.",
    icon: Link2,
  },
  {
    title: "Accept stablecoin payments",
    description: "Busha generates the pay-in instructions, QR code, address, and live status tracking.",
    icon: Wallet,
  },
  {
    title: "Operate with compliance rails",
    description: "Customers, recipients, and webhooks all sit behind the same Busha-backed workflow.",
    icon: ShieldCheck,
  },
];

const steps = [
  "Create a payment link for a project, invoice, or milestone.",
  "Share the hosted pay page with your client.",
  "Let the payer send funds through Busha-generated payment instructions.",
  "Track status, recipients, and settlements from one dashboard.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,200,150,0.18),_transparent_28%),linear-gradient(180deg,_#f8fbfd_0%,_#eef5f3_52%,_#f8fbfd_100%)]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="absolute left-[-6rem] top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-40 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />

        <header className="relative z-10 rounded-[1.75rem] border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo_fluent.png"
                alt="Fluent logo"
                width={220}
                height={148}
                priority
                sizes="(max-width: 640px) 180px, 220px"
                className="h-14 w-auto flex-shrink-0 object-contain sm:h-16"
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold tracking-tight sm:text-xl">Fluent</p>
                <p className="text-[11px] leading-5 text-muted-foreground sm:text-xs">
                  Global payments for African businesses
                </p>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Link href="/login" className="btn-secondary justify-center px-3 py-2.5 text-sm sm:px-4">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary justify-center px-3 py-2.5 text-sm sm:px-4">
                Open demo
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 flex-col gap-10 py-10 sm:gap-12 sm:py-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-xs font-medium text-busha-slate shadow-sm backdrop-blur">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">Busha-powered payment requests for freelancers and lean teams</span>
            </div>

            <h1 className="max-w-4xl text-center font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-busha-slate sm:text-6xl lg:text-7xl">
              Get paid globally without building your own payment stack.
            </h1>

            <p className="mt-5 max-w-3xl text-center text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg">
              Fluent turns Busha&apos;s payment links, requests, recipients, and customer flows into a clean
              operating layer for African freelancers, agencies, and digital businesses.
            </p>

            <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/register" className="btn-primary justify-center px-6 py-3 text-base">
                Launch demo workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/overview" className="btn-secondary justify-center px-6 py-3 text-base">
                Jump to dashboard
              </Link>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
            <div className="grid w-full gap-3 sm:grid-cols-2">
              {steps.map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-5">
              <div className="rounded-[1.5rem] bg-busha-slate p-5 text-white sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/60">Live demo flow</p>
                    <p className="mt-2 font-display text-3xl font-bold">Freelance invoice</p>
                    <p className="mt-1 max-w-xs text-sm text-white/70">
                      Create a payment link, generate a Busha payment request, then watch status update in real time.
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                    Hackathon build
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Payment link</p>
                    <p className="mt-2 text-lg font-semibold">$2,400 invoice</p>
                    <p className="mt-1 text-xs text-white/60">Shareable link with redirect-safe pay flow</p>
                  </div>
                  <div className="rounded-2xl bg-primary/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Busha request</p>
                    <p className="mt-2 text-lg font-semibold">Address + QR</p>
                    <p className="mt-1 text-xs text-white/70">Created on demand when the payer starts checkout</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {features.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-busha-slate">{title}</p>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
