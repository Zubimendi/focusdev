"use client";

import React from "react";

export default function AuthHero() {
  return (
    <section className="hidden lg:flex flex-col w-7/12 bg-surface-container-lowest relative overflow-hidden items-center justify-center px-20 dot-grid">
      {/* Glow Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full"></div>
      
      <div className="relative z-10 w-full max-w-3xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-on-surface">
              Build in public.<br />
              <span className="text-primary">Stay in focus.</span>
            </h1>
            <p className="text-on-surface-variant text-lg font-medium max-w-md">
              The high-performance environment for modern developers to ship faster with monolithic clarity.
            </p>
          </div>

          <div className="relative mt-12 h-[450px]">
            {/* Main Card */}
            <div className="absolute top-0 left-0 w-full h-full bg-surface-container-high rounded-xl p-8 shadow-2xl overflow-hidden border border-outline-variant/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/40"></div>
                  <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary/40"></div>
                </div>
                <div className="h-6 w-32 bg-surface-container rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 space-y-4">
                  <div className="h-32 w-full bg-surface-container-lowest rounded-lg dot-grid"></div>
                  <div className="h-4 w-3/4 bg-surface-container rounded-full"></div>
                  <div className="h-4 w-1/2 bg-surface-container rounded-full"></div>
                </div>
                <div className="col-span-4 space-y-4">
                  <div className="h-16 w-full bg-primary/20 rounded-lg"></div>
                  <div className="h-16 w-full bg-surface-container rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Floating Stat Overlay */}
            <div className="absolute -bottom-6 -right-6 glass-panel p-6 rounded-xl shadow-2xl border border-outline-variant/20 w-64">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-secondary">timer</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Focus Session</span>
              </div>
              <div className="text-4xl font-mono font-bold text-on-surface">
                42:15
              </div>
              <div className="mt-4 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-2/3 shadow-[0_0_12px_rgba(78,222,163,0.4)]"></div>
              </div>
            </div>

            {/* Floating Checklist Item */}
            <div className="absolute -top-10 -left-10 glass-panel p-4 rounded-lg shadow-xl border border-outline-variant/20 flex items-center gap-4">
              <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
              </div>
              <span className="text-sm font-medium text-on-surface">Deploy production build</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
