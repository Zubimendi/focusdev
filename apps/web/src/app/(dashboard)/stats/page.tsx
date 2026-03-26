"use client";

import React, { useState } from "react";

export default function StatsPage() {
  const [range, setRange] = useState<"week" | "month">("week");

  const stats = [
    { label: "Focus Hours", value: "38.5h", change: "+12%", icon: "schedule", color: "text-primary" },
    { label: "Sessions", value: "24", change: "+4", icon: "bolt", color: "text-secondary" },
    { label: "Tasks Done", value: "14", change: "+2", icon: "check_circle", color: "text-tertiary" },
    { label: "Current Streak", value: "12d", change: "🔥", icon: "local_fire_department", color: "text-error" },
  ];

  const barData = [
    { day: "Mon", height: "60%", color: "bg-primary/40" },
    { day: "Tue", height: "80%", color: "bg-secondary" },
    { day: "Wed", height: "40%", color: "bg-primary" },
    { day: "Thu", height: "70%", color: "bg-error/40" },
    { day: "Fri", height: "30%", color: "bg-secondary/60" },
    { day: "Sat", height: "20%", color: "bg-primary/80" },
    { day: "Sun", height: "50%", color: "bg-primary/30" },
  ];

  const heatmap = Array.from({ length: 50 }, () => Math.floor(Math.random() * 5));

  return (
    <main className="max-w-[1400px] mx-auto p-12 flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-mono text-sm tracking-[0.3em] uppercase mb-2 block">Performance Hub</span>
          <h1 className="text-5xl font-black tracking-tighter text-on-surface">Your Progress</h1>
        </div>
        
        <div className="flex bg-surface-container-low p-1.5 rounded-xl self-start md:self-auto shadow-sm">
          <button 
            onClick={() => setRange("week")}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
              range === "week" ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setRange("month")}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
              range === "month" ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            This Month
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface-container-low p-8 rounded-2xl flex flex-col gap-6 group hover:bg-surface-container-high transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-surface-container-highest ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-1 rounded">
                {s.change}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-4xl font-mono font-bold text-on-surface">{s.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Charts Area */}
      <div className="grid grid-cols-12 gap-8">
        {/* Activity Heatmap */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Activity Density</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} className={`w-3 h-3 rounded-sm ${
                  v === 0 ? 'bg-surface-container-highest' : 
                  v === 1 ? 'bg-secondary/20' :
                  v === 2 ? 'bg-secondary/40' :
                  v === 3 ? 'bg-secondary/70' : 'bg-secondary'
                }`} />
              ))}
              <span>More</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {heatmap.map((val, i) => (
              <div 
                key={i} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-md transition-all hover:scale-125 hover:z-10 cursor-pointer ${
                  val === 0 ? 'bg-surface-container-highest' : 
                  val === 1 ? 'bg-secondary/20' :
                  val === 2 ? 'bg-secondary/40' :
                  val === 3 ? 'bg-secondary/70' : 'bg-secondary'
                }`}
                title={`Level ${val}`}
              />
            ))}
          </div>
          <p className="mt-8 text-sm text-on-surface-variant italic">
            Visualizing your deep focus consistency over the last 50 production cycles.
          </p>
        </section>

        {/* Intensity Chart */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 rounded-2xl flex flex-col shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-10">Daily Intensity</h2>
          <div className="flex-1 flex items-end justify-between gap-4 h-48 md:h-64 mb-6">
            {barData.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 hover:brightness-110 ${b.color}`}
                  style={{ height: b.height }}
                />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">{b.day}</span>
              </div>
            ))}
          </div>
          <div className="pt-6">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your peak focus occurs between <span className="text-on-surface font-bold">10:00 AM</span> and <span className="text-on-surface font-bold">2:00 PM</span>.
            </p>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-primary/5">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Best Day</p>
              <p className="text-xl font-bold text-on-surface">Tuesday</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-secondary/5">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-3xl">stars</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Longest Session</p>
              <p className="text-xl font-bold text-on-surface">3h 15m</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-error/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-error/5">
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-3xl">trending_up</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-error uppercase tracking-[0.2em]">Focus Score</p>
              <p className="text-xl font-bold text-on-surface">98 / 100</p>
            </div>
          </div>
        </section>
      </div>

      {/* Decorative background elements consistent with mobile */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </main>
  );
}
