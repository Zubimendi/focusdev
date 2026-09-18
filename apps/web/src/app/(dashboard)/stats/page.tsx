"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";

interface SummaryStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface BarDay {
  day: string;
  height: string;
  minutes: number;
  color: string;
}

interface ProjectBreakdown {
  projectId: string;
  name: string;
  color: string;
  focusMinutes: number;
  tasksDone: number;
}

interface StatsHighlights {
  bestDay?: string;
  longestSession?: string;
  focusScore?: number;
  peakHours?: { start: string; end: string };
}

interface StatsData {
  summary?: SummaryStat[];
  last7Days?: BarDay[];
  heatmap?: number[];
  highlights?: StatsHighlights;
  byProject?: ProjectBreakdown[];
}

interface DevActivity {
  id: string;
  type: "commit" | "pull_request" | string;
  repo: string;
  message: string;
  timestamp: string;
  count?: number;
}

export default function StatsPage() {
  const [range, setRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<StatsData | null>(null);
  const [activity, setActivity] = useState<DevActivity[]>([]);
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
      <main className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8 animate-pulse">
        <div className="h-14 bg-surface-container-low rounded-[var(--radius-md)] w-1/3 border border-[var(--border)]" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
          ))}
        </div>
        <div className="h-64 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
      </main>
    );
  }

  const stats = data?.summary || [];
  const barData = data?.last7Days || [];
  const heatmap = data?.heatmap || Array.from({ length: 50 }, () => 0);
  const highlights = data?.highlights || {};
  const byProject = data?.byProject || [];

  const rangeTabs = range === "week" ? ["This week", "This month"] : ["This week", "This month"];

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8">
      <PageHeader
        title="Stats"
        description="Focus time, consistency, and development activity."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/reviews/week"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-9 px-4 text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-[var(--border)]"
            >
              Weekly review
            </Link>
            <Tabs
              tabs={rangeTabs}
              active={range === "week" ? "This week" : "This month"}
              onChange={(tab) => setRange(tab === "This week" ? "week" : "month")}
            />
          </div>
        }
      />

      <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${loading ? "opacity-60" : ""}`}>
        {stats.map((s, i) => (
          <Panel key={i} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-md bg-surface-container border border-[var(--border)] ${s.color}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                {s.change}
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
              <p className="text-2xl font-mono font-medium text-on-surface">{s.value}</p>
            </div>
          </Panel>
        ))}
      </section>

      <div className="grid grid-cols-12 gap-4">
        <Panel className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-base text-on-surface tracking-tight">
              Activity density
            </h2>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
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
          <p className="mt-6 text-xs text-on-surface-variant">
            Deep focus consistency over the last 50 cycles.
          </p>
        </Panel>

        <Panel className="col-span-12 lg:col-span-4 flex flex-col">
          <h2 className="font-headline text-base text-on-surface tracking-tight mb-6">
            Daily intensity
          </h2>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 md:h-64 mb-6 overflow-x-auto">
            {barData.map((b, i) => (
              <div key={i} className="flex-1 min-w-[1.5rem] flex flex-col items-center gap-4 group">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 hover:brightness-110 ${b.color}`}
                  style={{ height: b.height || "4%" }}
                  title={`${b.minutes}m`}
                />
                <span className="text-xs text-on-surface-variant">
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
        </Panel>

        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Panel className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 border border-[var(--border)] flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                workspace_premium
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Best day</p>
              <p className="text-base font-medium text-on-surface">
                {highlights.bestDay || "—"}
              </p>
            </div>
          </Panel>

          <Panel className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-secondary/10 border border-[var(--border)] flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[20px]">stars</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Longest session</p>
              <p className="text-base font-medium text-on-surface">
                {highlights.longestSession || "—"}
              </p>
            </div>
          </Panel>

          <Panel className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-error/10 border border-[var(--border)] flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                trending_up
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Focus score</p>
              <p className="text-base font-medium text-on-surface">
                {highlights.focusScore != null
                  ? `${highlights.focusScore} / 100`
                  : "—"}
              </p>
            </div>
          </Panel>
        </section>

        {byProject.length > 0 && (
          <Panel className="col-span-12">
            <h2 className="font-headline text-base text-on-surface tracking-tight mb-4">
              By project
            </h2>
            <div className="flex flex-col gap-3">
              {byProject.map((p) => {
                const totalFocus = byProject.reduce(
                  (a, x) => a + (x.focusMinutes || 0),
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
                    className="flex items-center gap-4 p-3 rounded-md hover:bg-surface-container-low transition-colors"
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
          </Panel>
        )}
      </div>

      <Panel>
        <div className="mb-6">
          <h2 className="font-headline text-base text-on-surface tracking-tight">
            Latest dev activity
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Recent commits and pull requests from linked repositories
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {activity.length > 0 ? (
            activity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded-md border border-[var(--border)] bg-surface-container-low hover:bg-surface-container transition-colors group"
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
                    <p className="text-xs text-on-surface-variant font-mono">
                      {act.repo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">
                    {new Date(act.timestamp).toLocaleDateString()}{" "}
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {act.type === "commit" && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md">
                      {act.count} commits
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">
                terminal
              </span>
              <p className="text-on-surface-variant text-sm font-medium">
                No recent activity found. Make sure your GitHub is connected.
              </p>
            </div>
          )}
        </div>
      </Panel>
    </main>
  );
}
