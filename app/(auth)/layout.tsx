import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2 } from "lucide-react";

const authHighlights = [
  "Create Busha-backed payment links in seconds",
  "Turn payer details into live payment requests with QR and status tracking",
  "Manage customers, recipients, settlements, and webhook delivery from one dashboard",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,200,150,0.18),_transparent_28%),linear-gradient(180deg,_#0d1b2a_0%,_#102132_50%,_#f4f9f8_50%,_#f4f9f8_100%)] lg:bg-[linear-gradient(90deg,_#0d1b2a_0%,_#102132_50%,_#f4f9f8_50%,_#f4f9f8_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] items-stretch gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[1fr_minmax(480px,540px)] lg:gap-24 lg:px-12 xl:grid-cols-[1.1fr_minmax(520px,600px)] xl:gap-32">
        <section className="hidden overflow-hidden flex-col justify-between rounded-[2rem] border border-white/10 bg-busha-slate/90 p-8 text-white shadow-2xl shadow-slate-950/20 backdrop-blur lg:flex xl:p-10">
          <div className="mx-auto flex w-full max-w-lg flex-col">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo_fluent.png"
                alt="Fluent logo"
                width={220}
                height={148}
                priority
                sizes="220px"
                className="h-14 w-auto object-contain"
              />
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold">Fluent</p>
                <p className="text-sm text-white/55">Hackathon submission build</p>
              </div>
            </Link>

            <div className="mt-14 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                Cross-border collection workflow for freelancers and digital teams
              </div>

              <h1 className="mt-6 max-w-lg font-display text-[2.9rem] font-extrabold leading-[0.98] tracking-[-0.04em] xl:text-[3.35rem]">
                Cleaner payment operations, built on top of Busha.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/68">
                Fluent is the product layer: shareable links, real payment requests, live status tracking,
                customer onboarding, and operational dashboards for small African businesses.
              </p>

              <div className="mt-10 space-y-3">
                {authHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-white/80">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/overview" className="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white">
            View dashboard preview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="flex items-center justify-center py-6 lg:justify-end lg:py-10 lg:pl-2">{children}</section>
      </div>
    </div>
  );
}
