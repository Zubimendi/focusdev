"use client";

import React from "react";
import FocusLogo from "@/components/brand/focus-logo";

export default function AuthHero() {
  return (
    <section className="hidden lg:flex flex-col w-7/12 bg-[#e8ecea] relative overflow-hidden items-center justify-center px-16 xl:px-24">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c5ceca 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="text-primary">
          <FocusLogo size={40} className="text-primary text-2xl" />
        </div>
        <div className="space-y-3">
          <h1
            className="text-4xl xl:text-5xl tracking-tight text-[#1c2421] leading-[1.15]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Build with calm.
            <br />
            <span className="text-[#2d6a5e]">Stay in focus.</span>
          </h1>
          <p className="text-[#4a5550] text-base max-w-md leading-relaxed">
            Track projects, run deep work sessions, and close the week with a
            clear review — one workspace for personal shipping.
          </p>
        </div>

        <div className="mt-10 border border-[#c5ceca] bg-[#f7faf8] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#4a5550]">
              Focus session
            </span>
            <span className="text-[11px] font-mono text-[#2d6a5e]">
              In progress
            </span>
          </div>
          <div className="font-mono text-3xl font-medium text-[#1c2421] tracking-tight">
            42:15
          </div>
          <div className="mt-4 h-1 w-full bg-[#e2e7e5] rounded-full overflow-hidden">
            <div className="h-full bg-[#2d6a5e] w-2/3 rounded-full" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#1c2421]">
            <span
              className="material-symbols-outlined text-[#2d6a5e] text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Ship projects hub
          </div>
        </div>
      </div>
    </section>
  );
}
