"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewSessionPage() {
  const [task, setTask] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!task) {
      toast.error("Please define your work before heading into the abyss.");
      return;
    }
    toast.success("Initialization sequence complete. Redirecting to deep work...");
    // Simulate navigation to dashboard or timer
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="relative flex-grow flex items-center justify-center p-6 bg-surface min-h-screen">
      {/* Background Layer with Dot Grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #2f3445 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Visual Embellishments */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12 items-start z-10">
        {/* Left Column: Step Indicator */}
        <div className="md:col-span-4 flex flex-col gap-12 pt-8">
          <div className="flex flex-col gap-2">
            <span className="text-primary font-mono text-sm tracking-widest uppercase opacity-80 font-bold">Initialization</span>
            <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">New Session</h1>
          </div>
          
          <nav className="flex flex-col gap-8">
            <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-on-primary font-mono font-bold shadow-[0_0_30px_rgba(192,193,255,0.4)] text-xl transition-all">1</div>
              <div className="flex flex-col">
                <span className="text-on-surface font-bold text-xl tracking-tight">Define Work</span>
                <span className="text-on-surface-variant text-sm font-medium opacity-60">Identifying the core task</span>
              </div>
            </div>
            
            <div className="flex items-center gap-5 opacity-30 grayscale group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 font-mono font-bold text-xl">2</div>
              <div className="flex flex-col">
                <span className="text-on-surface font-bold text-xl tracking-tight">Set Goal</span>
                <span className="text-on-surface-variant text-sm font-medium">Target outcome</span>
              </div>
            </div>

            <div className="flex items-center gap-5 opacity-30 grayscale group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 font-mono font-bold text-xl">3</div>
              <div className="flex flex-col">
                <span className="text-on-surface font-bold text-xl tracking-tight">Configuration</span>
                <span className="text-on-surface-variant text-sm font-medium">Review & Launch</span>
              </div>
            </div>
          </nav>

          <div className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary shadow-xl">
            <p className="text-on-surface-variant text-sm leading-relaxed italic font-medium">
              &quot;The secret to deep work is not just focus, but the clarity of what you are focusing on.&quot;
            </p>
          </div>
        </div>

        {/* Right Column: Content Canvas */}
        <div className="md:col-span-8 bg-surface-container-low/60 backdrop-blur-3xl rounded-3xl p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-outline-variant/10 relative">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <label className="text-3xl font-black text-primary tracking-tight">What are you working on?</label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest text-on-surface text-2xl p-7 rounded-2xl border-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/30 font-bold shadow-inner" 
                  placeholder="e.g. Refactoring Auth Middleware" 
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 text-on-surface-variant/40">
                  <span className="text-xs font-mono bg-surface-container-high px-2 py-1 rounded-lg border border-outline-variant/20">CMD + K</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Quick Tags</span>
              <div className="flex flex-wrap gap-3">
                {["Frontend", "Backend", "System Design", "Debugging"].map((tag) => (
                  <button key={tag} className="px-6 py-3 rounded-full bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 border border-outline-variant/10 font-bold text-sm shadow-sm active:scale-95">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-6 border-t border-outline-variant/10">
              <label className="text-xl font-bold text-on-surface tracking-tight">Select your goal for this session</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-container-high rounded-2xl border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest transition-all group scale-100 hover:scale-[1.02] active:scale-95 shadow-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
                    <span className="font-black text-on-surface text-lg">Complete Task</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">Focus until the current component is merged or feature is stable.</p>
                </div>
                <div className="p-6 bg-surface-container-lowest border-2 border-primary rounded-2xl cursor-pointer transition-all group relative overflow-hidden shadow-2xl scale-[1.03]">
                  <div className="absolute inset-0 bg-primary/10"></div>
                  <div className="relative z-10 flex items-center gap-4 mb-3">
                    <span className="material-symbols-outlined text-primary text-3xl">timer</span>
                    <span className="font-black text-on-surface text-lg">Deep Focus (90m)</span>
                  </div>
                  <p className="relative z-10 text-xs text-on-surface-variant font-bold leading-relaxed">Uninterrupted high-intensity coding session with flow-state tracking.</p>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-10 mt-4 border-t border-outline-variant/10">
              <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface font-bold flex items-center gap-2 transition-all group text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined transition-transform group-hover:scale-125">close</span>
                Cancel
              </Link>
              <div className="flex items-center gap-6">
                <span className="text-on-surface-variant font-mono text-sm hidden sm:inline-block opacity-40">Step 1 of 3</span>
                <button 
                  onClick={handleStart}
                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary font-black uppercase tracking-widest px-12 py-5 rounded-xl shadow-[0_20px_50px_rgba(128,131,255,0.4)] hover:shadow-[0_25px_60px_rgba(128,131,255,0.5)] active:scale-95 transition-all flex items-center gap-4 group"
                >
                  Go Deep
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Timer Preview */}
      <div className="fixed bottom-10 right-10 bg-surface-container-high/40 backdrop-blur-2xl px-8 py-5 rounded-3xl border border-outline-variant/10 flex items-center gap-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] scale-100 hover:scale-[1.05] transition-all">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 mb-1">Next Block</span>
          <span className="text-3xl font-mono font-black text-on-surface">90:00</span>
        </div>
        <div className="w-px h-10 bg-outline-variant/30"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-60 mb-2">Intensity</span>
          <div className="flex gap-1.5">
            {[1, 1, 1, 0, 0].map((v, i) => (
              <div key={i} className={`w-2 h-4 rounded-full ${v ? 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-surface-container-highest'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
