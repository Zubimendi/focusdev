"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { Fraunces, Outfit } from "next/font/google";
import FocusLogo from "@/components/brand/focus-logo";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
  weight: ["400", "500", "600"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-landing-sans",
  weight: ["400", "500", "600", "700"],
});

export default function LandingPage() {
  return (
    <div
      className={`${display.variable} ${sans.variable} landing-root min-h-screen antialiased`}
      style={
        {
          "--landing-core": "#EEF1F0",
          fontFamily: "var(--font-landing-sans), system-ui, sans-serif",
          background: "#EEF1F0",
          color: "#1C2421",
        } as CSSProperties
      }
    >
      <style>{`
        @keyframes landing-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes landing-breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes landing-tick {
          0% { stroke-dashoffset: 220; }
          100% { stroke-dashoffset: 40; }
        }
        .landing-rise {
          animation: landing-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .landing-rise-delay-1 { animation-delay: 0.12s; }
        .landing-rise-delay-2 { animation-delay: 0.24s; }
        .landing-rise-delay-3 { animation-delay: 0.36s; }
        .landing-rise-delay-4 { animation-delay: 0.5s; }
        .landing-breathe { animation: landing-breathe 5.5s ease-in-out infinite; }
        .landing-ring-progress {
          stroke-dasharray: 220;
          animation: landing-tick 8s ease-in-out infinite alternate;
        }
      `}</style>

      <header className="relative min-h-[100svh] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/landing-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#EEF1F0]/93 via-[#EEF1F0]/80 to-[#EEF1F0]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(45,106,94,0.14),transparent_55%)]" />
        </div>

        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 landing-rise">
          <FocusLogo size={36} className="text-[#1C2421] text-[1.45rem]" />
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-[#1C2421]/70 hover:text-[#1C2421] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-md bg-[#1C2421] text-[#EEF1F0] hover:bg-[#2D6A5E] transition-colors"
            >
              Start free
            </Link>
          </div>
        </nav>

        <main className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 pb-16 pt-8 max-w-6xl mx-auto w-full">
          <p className="landing-rise landing-rise-delay-1 mb-6 text-[#2D6A5E] text-sm md:text-base tracking-[0.08em] uppercase font-medium">
            For developers who protect their attention
          </p>

          <h1
            className="landing-rise landing-rise-delay-2 text-[clamp(3.25rem,9vw,6.75rem)] leading-[0.92] tracking-[-0.03em] text-[#1C2421] max-w-4xl font-medium"
            style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
          >
            Deep work,
            <br />
            <span className="text-[#2D6A5E]">quietly measured.</span>
          </h1>

          <p className="landing-rise landing-rise-delay-3 mt-7 max-w-xl text-lg md:text-xl text-[#1C2421]/70 leading-relaxed">
            FocusDev is your personal studio for focus sessions, projects, and
            weekly reviews—built for how you actually ship.
          </p>

          <div className="landing-rise landing-rise-delay-4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-[#2D6A5E] text-[#EEF1F0] text-base font-semibold hover:bg-[#24584E] transition-colors"
            >
              Begin your practice
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-md border border-[#1C2421]/20 text-[#1C2421] text-base font-medium hover:border-[#1C2421]/45 transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </main>

        <div className="relative z-10 px-4 md:px-12 pb-0 landing-rise landing-rise-delay-4">
          <div className="max-w-5xl mx-auto relative">
            <div className="rounded-t-2xl border border-b-0 border-[#1C2421]/10 bg-[#1C2421] shadow-[0_-24px_64px_rgba(28,36,33,0.14)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="ml-3 text-[11px] tracking-wide text-white/40 font-medium">
                  focusdev — today
                </span>
              </div>
              <div className="grid md:grid-cols-[1fr_280px] min-h-[280px] md:min-h-[340px]">
                <div className="flex flex-col items-center justify-center gap-6 p-10 md:p-14">
                  <div className="relative w-40 h-40 landing-breathe">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#7EB8A8"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="landing-ring-progress"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#EEF1F0]">
                      <span
                        className="text-3xl tracking-tight font-medium"
                        style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
                      >
                        24:18
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1">
                        deep work
                      </span>
                    </div>
                  </div>
                  <p className="text-white/55 text-sm text-center max-w-xs">
                    Session linked to{" "}
                    <span className="text-[#7EB8A8]">FocusDev Monorepo</span>
                  </p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col gap-4 bg-white/[0.03]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    This week
                  </p>
                  {[
                    { name: "FocusDev", h: "12h 40m", w: "82%" },
                    { name: "Client API", h: "4h 15m", w: "38%" },
                    { name: "Portfolio", h: "1h 50m", w: "18%" },
                  ].map((row) => (
                    <div key={row.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs text-white/70">
                        <span>{row.name}</span>
                        <span className="font-mono text-white/45">{row.h}</span>
                      </div>
                      <div className="h-1 rounded-sm bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-sm bg-[#7EB8A8]/80"
                          style={{ width: row.w }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="mt-auto text-xs text-white/35 leading-relaxed pt-4">
                    End the week with a short review—hours, OKRs, and what
                    actually got in the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-[#EEF1F0] px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-end">
          <h2
            className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-[#1C2421] font-medium"
            style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
          >
            Treat attention
            <br />
            like a craft.
          </h2>
          <p className="text-lg text-[#1C2421]/65 leading-relaxed max-w-md pb-1">
            Start a session. Tie it to a project. Close the loop with tasks and
            goals—so progress is something you can feel at the end of the day,
            not guess at.
          </p>
        </div>
      </section>

      <section className="relative bg-[#E2E7E5] px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.14em] text-[#2D6A5E] font-medium mb-5">
            The weekly close
          </p>
          <h2
            className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-[#1C2421] max-w-2xl mb-8 font-medium"
            style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
          >
            A calm review, not another dashboard to ignore.
          </h2>
          <p className="text-lg text-[#1C2421]/65 leading-relaxed max-w-xl mb-14">
            Numbers for focus hours and finished work. Scores for the goals you
            set. Space to write what worked, what blocked you, and what next
            week should protect.
          </p>
          <div className="grid sm:grid-cols-3 gap-8 md:gap-12 border-t border-[#1C2421]/10 pt-12">
            {[
              {
                title: "Measure",
                body: "Hours, sessions, and tasks—broken down by project.",
              },
              {
                title: "Score",
                body: "Weekly OKRs you can mark met, open, or missed.",
              },
              {
                title: "Reflect",
                body: "Wins, blockers, and intentions—in your own words.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3
                  className="text-xl text-[#1C2421] mb-3 font-medium"
                  style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[#1C2421]/60 leading-relaxed text-[15px]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#1C2421] text-[#EEF1F0] px-6 md:px-12 py-24 md:py-28">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <FocusLogo size={48} className="text-[#7EB8A8] text-[1.75rem]" />
          <h2
            className="text-[clamp(2rem,4.5vw,3rem)] leading-[1.1] tracking-[-0.02em] font-medium"
            style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
          >
            Make room for the work
            <br />
            that matters.
          </h2>
          <p className="text-[#EEF1F0]/60 text-lg max-w-md leading-relaxed">
            Free to start. Built for solo developers juggling more than one
            project—and ready when you grow.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-[#7EB8A8] text-[#1C2421] text-base font-semibold hover:bg-[#95C9BB] transition-colors"
          >
            Create your workspace
          </Link>
        </div>
      </section>

      <footer className="bg-[#1C2421] border-t border-white/10 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/35">
        <FocusLogo size={22} className="text-white/50 text-base" />
        <p>© {new Date().getFullYear()} FocusDev. Built for deep work.</p>
      </footer>
    </div>
  );
}
