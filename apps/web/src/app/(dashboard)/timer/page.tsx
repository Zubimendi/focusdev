"use client";

import React, { useState, useEffect } from "react";

export default function TimerPage() {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((1500 - seconds) / 1500) * 880;

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-12 relative overflow-hidden">
      {/* Top Controls / Settings */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 text-on-surface-variant text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>
          Deep Focus Active
        </div>
        <button className="p-3 bg-surface-container-high rounded-full text-on-surface hover:bg-surface-bright transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>

      {/* Timer Core Section */}
      <section className="w-full max-w-4xl flex flex-col items-center text-center">
        <div className="relative w-96 h-96 flex items-center justify-center mb-16">
          {/* Circular Track */}
          <svg className="absolute inset-0 w-full h-full">
            <circle className="text-surface-container-high" cx="192" cy="192" fill="transparent" r="140" stroke="currentColor" strokeWidth="4"></circle>
            <circle 
              className="text-primary" 
              cx="192" cy="192" fill="transparent" r="140" 
              stroke="url(#timerGradient)" 
              strokeLinecap="round" 
              strokeWidth="12"
              strokeDasharray="880"
              strokeDashoffset={880 - (isActive ? progress : 220)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '192px 192px', transition: 'stroke-dashoffset 1s linear' }}
            ></circle>
            <defs>
              <linearGradient id="timerGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#c0c1ff"></stop>
                <stop offset="100%" stopColor="#8083ff"></stop>
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer Digits */}
          <div className="z-10 flex flex-col items-center">
            <span className="text-8xl font-mono font-bold tracking-tighter text-on-surface">
              {formatTime(seconds)}
            </span>
            <span className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant mt-2">Pomodoro Session</span>
          </div>
          
          {/* Ambient Glow Behind Timer */}
          <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full -z-10"></div>
        </div>

        {/* Timer Actions */}
        <div className="flex items-center gap-8 mb-24">
          <button onClick={() => setSeconds(1500)} className="group flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/10 flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Reset</span>
          </button>
          
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_0_40px_rgba(128,131,255,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isActive ? "pause" : "play_arrow"}
            </span>
          </button>
          
          <button className="group flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/10 flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">coffee</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Break</span>
          </button>
        </div>

        {/* "Next Up" Bento-style Checklist */}
        <div className="w-full grid grid-cols-12 gap-6">
          <div className="col-span-12 flex items-center justify-between mb-2">
            <h2 className="text-xl font-black tracking-tight text-on-surface">Next Up</h2>
            <span className="text-xs font-mono text-primary">3 Tasks Remaining</span>
          </div>
          
          {/* Active Task Card */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-low p-6 rounded-2xl flex items-center gap-6 group hover:bg-surface-container transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">terminal</span>
            </div>
            <div className="text-left flex-1">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Current Focus</p>
              <h3 className="text-lg font-bold text-on-surface">Refactor API Middleware Hooks</h3>
              <p className="text-sm text-on-surface-variant">Clean up redundant logic in auth providers</p>
            </div>
            <button className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
              <span className="material-symbols-outlined text-transparent group-hover:text-on-primary text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
            </button>
          </div>

          {/* Secondary Task */}
          <div className="col-span-12 md:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 flex items-center justify-between group hover:bg-surface-container-low transition-all">
            <div className="text-left">
              <h4 className="font-bold text-on-surface">Update README.md</h4>
              <p className="text-xs text-on-surface-variant">Add setup instructions for v2.4</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40">drag_indicator</span>
          </div>

          {/* Small Task Meta Card */}
          <div className="col-span-6 md:col-span-3 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-mono font-bold text-secondary mb-1">12</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Day Streak</span>
          </div>
          <div className="col-span-6 md:col-span-3 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-mono font-bold text-tertiary mb-1">04</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Sessions Goal</span>
          </div>

          {/* Quick Action Card */}
          <div className="col-span-12 md:col-span-6 bg-surface-container-highest/50 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-surface-container-highest transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-bright flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface">add</span>
              </div>
              <span className="font-bold text-on-surface">Add a quick task...</span>
            </div>
            <kbd className="px-2 py-1 bg-surface-container rounded font-mono text-[10px] text-on-surface-variant">CMD + N</kbd>
          </div>
        </div>
      </section>

      {/* Dynamic Background Elements */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}
