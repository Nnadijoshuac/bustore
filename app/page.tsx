"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Dot, MoveUpRight } from "lucide-react";

const valuePoints = [
  "Create polished payment links for invoices, retainers, and milestones.",
  "Generate live Busha payment instructions only when a client starts checkout.",
  "Track payment activity, customers, settlements, and webhooks in one workspace.",
];

const proofItems = [
  { label: "For", value: "Freelancers, agencies, creators" },
  { label: "Flow", value: "Link to live payment request" },
  { label: "Outcome", value: "Collect globally, settle locally" },
];

function PoweredByBusha() {
  return (
    <div className="inline-flex items-center gap-4 rounded-[2rem] border border-slate-800 bg-slate-950 px-5 py-4 text-[11px] font-medium text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
      <span className="uppercase tracking-[0.24em] text-white/60">Powered by</span>
      <Image
        src="/busha_logo.png"
        alt="Busha"
        width={820}
        height={180}
        priority
        unoptimized
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,200,150,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_22%),linear-gradient(180deg,_#ffffff_0%,_#f4f7f6_48%,_#ffffff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-slate-200 bg-white/92 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo_fluent.png"
              alt="Fluent logo"
              width={180}
              height={120}
              priority
              sizes="180px"
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-950 sm:text-[15px]">
              Fluent
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition-all hover:border-slate-950 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-slate-800"
            >
              Open demo
            </Link>
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-14 lg:py-20">
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1.1fr)_440px] lg:items-center">
            <div className="max-w-4xl">
              <PoweredByBusha />

              <div className="mt-10 space-y-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Global client payments for African businesses
                </p>

                <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[0.88] tracking-[-0.075em] text-slate-950 sm:text-6xl lg:text-[6.1rem]">
                  Built for African businesses that want to look sharp and get paid globally.
                </h1>

                <p className="max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                  Fluent gives freelancers and lean teams a deliberate payment experience: send a link, trigger live
                  Busha-powered instructions at checkout, and manage collections, customers, settlements, and payment
                  activity from one refined workspace.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800"
                >
                  Launch workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/overview"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition-all hover:border-slate-950 hover:bg-slate-50"
                >
                  View dashboard
                  <MoveUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
                <span>Invoices</span>
                <Dot className="h-4 w-4 text-primary" />
                <span>Stablecoin and local rails</span>
                <Dot className="h-4 w-4 text-primary" />
                <span>Settlements</span>
                <Dot className="h-4 w-4 text-primary" />
                <span>Webhook visibility</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-300 bg-slate-950 p-5 text-white shadow-[0_40px_120px_rgba(15,23,42,0.2)] sm:p-6">
              <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-start gap-4 border-b border-white/10 pb-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">Fluent Flow</p>
                    <h2 className="mt-3 font-display text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                      A cleaner path from invoice link to actual money movement
                    </h2>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {valuePoints.map((item, index) => (
                    <div key={item} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-slate-950">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-7 text-white/82">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {proofItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-white/88">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
