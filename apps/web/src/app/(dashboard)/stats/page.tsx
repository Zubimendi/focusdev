"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function StatsPage() {
  const [range, setRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch(`/api/focus/stats?range=${range}`),
          fetch("/api/github/activity"),
        ]);

        const statsJson = await statsRes.json();
        const activityJson = await activityRes.json().catch(() => ({ activity: [] }));

        setData(statsJson);
        setActivity(activityJson.activity || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [range]);

  if (loading && !data) {
    return (
      <main className="max-w-[1400px] mx-auto p-12 flex flex-col gap-12 animate-pulse">
        <div className="h-20 bg-surface-container-low rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-surface-container-low rounded-2xl"></div>
      </main>
    );
  }

  const stats = data?.summary || [];
  const barData = data?.last7Days || [];
  const heatmap = data?.heatmap || Array.from({ length: 50 }, () => 0);
  const highlights = data?.highlights || {};
  const byProject = data?.byProject || [];

  return (
    <main className="max-w-[1400px] mx-auto p-12 flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-mono text-sm tracking-[0.3em] uppercase mb-2 block">
            Performance Hub
          </span>
          <h1 className="text-5xl font-black tracking-tighter text-on-surface">
            Your Progress
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/reviews/week"
            className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all"
          >
            Weekly Review
          </Link>
          <div className="flex bg-surface-container-low p-1.5 rounded-xl self-start md:self-auto shadow-sm">
            <button
              onClick={() => setRange("week")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
                range === "week"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
                range === "month"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </header>

      <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${loading ? "opacity-60" : ""}`}>
        {stats.map((s: any, i: number) => (
          <div
            key={i}
            className="bg-surface-container-low p-8 rounded-2xl flex flex-col gap-6 group hover:bg-surface-container-high transition-all shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-surface-container-highest ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-1 rounded">
                {s.change}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                {s.label}
              </p>
              <p className="text-4xl font-mono font-bold text-on-surface">{s.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              Activity Density
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((v) => (
                <div
                  key={v}
                  className={`w-3 h-3 rounded-sm ${
                    v === 0
                      ? "bg-surface-container-highest"
                      : v === 1
                        ? "bg-secondary/20"
                        : v === 2
                          ? "bg-secondary/40"
                          : v === 3
                            ? "bg-secondary/70"
                            : "bg-secondary"
                  }`}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {heatmap.map((val: number, i: number) => (
              <div
                key={i}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-md transition-all hover:scale-125 hover:z-10 cursor-pointer ${
                  val === 0
                    ? "bg-surface-container-highest"
                    : val === 1
                      ? "bg-secondary/20"
                      : val === 2
                        ? "bg-secondary/40"
                        : val === 3
                          ? "bg-secondary/70"
                          : "bg-secondary"
                }`}
                title={`Level ${val}`}
              />
            ))}
          </div>
          <p className="mt-8 text-sm text-on-surface-variant italic">
            Visualizing your deep focus consistency over the last 50 production
            cycles.
          </p>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 rounded-2xl flex flex-col shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-10">
            Daily Intensity
          </h2>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 md:h-64 mb-6 overflow-x-auto">
            {barData.map((b: any, i: number) => (
              <div key={i} className="flex-1 min-w-[1.5rem] flex flex-col items-center gap-4 group">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 hover:brightness-110 ${b.color}`}
                  style={{ height: b.height || "4%" }}
                  title={`${b.minutes}m`}
                />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  {b.day}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-6">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your peak focus occurs between{" "}
              <span className="text-on-surface font-bold">
                {highlights.peakHours?.start || "—"}
              </span>{" "}
              and{" "}
              <span className="text-on-surface font-bold">
                {highlights.peakHours?.end || "—"}
              </span>
              .
            </p>
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-primary/5">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">
                workspace_premium
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Best Day
              </p>
              <p className="text-xl font-bold text-on-surface">
                {highlights.bestDay || "—"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-secondary/5">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-3xl">stars</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
                Longest Session
              </p>
              <p className="text-xl font-bold text-on-surface">
                {highlights.longestSession || "—"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-error/10 to-transparent p-8 rounded-2xl flex items-center gap-6 shadow-sm shadow-error/5">
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-3xl">
                trending_up
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-error uppercase tracking-[0.2em]">
                Focus Score
              </p>
              <p className="text-xl font-bold text-on-surface">
                {highlights.focusScore != null
                  ? `${highlights.focusScore} / 100`
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {byProject.length > 0 && (
          <section className="col-span-12 bg-surface-container-low p-10 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-6">
              By Project
            </h2>
            <div className="flex flex-col gap-3">
              {byProject.map((p: any) => {
                const totalFocus = byProject.reduce(
                  (a: number, x: any) => a + (x.focusMinutes || 0),
                  0
                );
                const pct =
                  totalFocus > 0
                    ? Math.round((p.focusMinutes / totalFocus) * 100)
                    : 0;
                const h = Math.floor(p.focusMinutes / 60);
                const m = p.focusMinutes % 60;
                const time = h > 0 ? `${h}h ${m}m` : `${m}m`;
                return (
                  <Link
                    key={p.projectId}
                    href={`/projects/${p.projectId}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-bold text-on-surface flex-1">
                      {p.name}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {p.tasksDone} tasks
                    </span>
                    <span className="text-sm font-mono font-bold text-on-surface w-20 text-right">
                      {time}
                    </span>
                    <span className="text-xs font-bold text-secondary w-12 text-right">
                      {pct}%
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <section className="bg-surface-container-low p-10 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              Latest Dev Activity
            </h2>
            <p className="text-sm text-on-surface-variant">
              Real-time progress from your GitHub repositories
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {activity.length > 0 ? (
            activity.map((act: any) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-4 bg-surface-container-highest/30 rounded-xl hover:bg-surface-container-highest transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      act.type === "commit"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {act.type === "commit" ? "history" : "pull_request"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                      {act.message}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                      {act.repo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    {new Date(act.timestamp).toLocaleDateString()} AT{" "}
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {act.type === "commit" && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded uppercase">
                      {act.count} COMMITS
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">
                terminal
              </span>
              <p className="text-on-surface-variant text-sm font-medium">
                No recent activity found. Make sure your GitHub is connected.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </main>
  );
}
