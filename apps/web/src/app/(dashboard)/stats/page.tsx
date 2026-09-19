"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { useSettingsStore } from "@/store/settings";
import {
  FocusBarChart,
  FocusLineChart,
  ProjectDonut,
} from "@/components/stats/charts";
import { PageSkeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/motion";

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
  weekOverWeek?: {
    focusMinutesChange?: string;
    sessionsChange?: string;
    tasksChange?: string;
  };
  totals?: { sessionCount?: number; focusMinutes?: number };
}

interface DevActivity {
  id: string;
  type: "commit" | "pull_request" | string;
  repo: string;
  message: string;
  timestamp: string;
  count?: number;
  commitTag?: string;
  attributed?: boolean;
}

export default function StatsPage() {
  const showCharts = useSettingsStore((s) => s.showCharts);
  const setShowCharts = useSettingsStore((s) => s.setShowCharts);
  const [range, setRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<StatsData | null>(null);
  const [activity, setActivity] = useState<DevActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.user?.preferences?.showCharts === "boolean") {
          setShowCharts(d.user.preferences.showCharts);
        }
      })
      .catch(() => undefined);
  }, [setShowCharts]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const statsUrl = `/api/focus/stats?range=${range}&charts=${showCharts ? "1" : "0"}`;
        if (showCharts) {
          const [statsRes, activityRes] = await Promise.all([
            fetch(statsUrl),
            fetch("/api/github/activity"),
          ]);
          const statsJson = await statsRes.json();
          const activityJson = await activityRes
            .json()
            .catch(() => ({ activity: [] }));
          setData(statsJson);
          setActivity(activityJson.activity || []);
        } else {
          const statsRes = await fetch(statsUrl);
          const statsJson = await statsRes.json();
          setData(statsJson);
          setActivity([]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [range, showCharts]);

  if (loading && !data) {
    return (
      <main className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10">
        <PageSkeleton cards={4} />
      </main>
    );
  }

  const stats = data?.summary || [];
  const barData = data?.last7Days || [];
  const heatmap = data?.heatmap || [];
  const hasHeatmapActivity = heatmap.some((v) => v > 0);
  const highlights = data?.highlights || {};
  const byProject = data?.byProject || [];
  const hasSessions = (data?.totals?.sessionCount || 0) > 0;
  const rangeTabs = ["This week", "This month"];

  return (
    <FadeIn>
    <main className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8">
      <PageHeader
        title="Stats"
        description="Your personal performance snapshot — focus, delivery, and consistency."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/reviews/week"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-9 px-4 text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-[var(--border)]"
            >
              Weekly review
            </Link>
            <Link
              href="/reviews/month"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-9 px-4 text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-[var(--border)]"
            >
              Monthly review
            </Link>
            <Tabs
              tabs={rangeTabs}
              active={range === "week" ? "This week" : "This month"}
              onChange={(tab) =>
                setRange(tab === "This week" ? "week" : "month")
              }
            />
          </div>
        }
      />

      {!showCharts && (
        <p className="text-xs text-on-surface-variant">
          Charts are off. Turn them on in{" "}
          <Link href="/settings" className="text-primary hover:underline">
            Settings → Preferences
          </Link>{" "}
          to load trends and GitHub activity.
        </p>
      )}

      {data?.weekOverWeek && hasSessions && (
        <Panel className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">
              vs prior period
            </p>
            <p className="font-medium text-on-surface">
              Focus {data.weekOverWeek.focusMinutesChange}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">Sessions</p>
            <p className="font-medium text-on-surface">
              {data.weekOverWeek.sessionsChange}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">Tasks done</p>
            <p className="font-medium text-on-surface">
              {data.weekOverWeek.tasksChange}
            </p>
          </div>
        </Panel>
      )}

      <section
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${loading ? "opacity-60" : ""}`}
      >
        {stats.length === 0 ? (
          <Panel className="col-span-full py-10 text-center text-sm text-on-surface-variant">
            No performance data yet. Start a focus session to begin tracking.
          </Panel>
        ) : (
          stats.map((s, i) => (
            <Panel key={i} className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div
                  className={`p-2 rounded-md bg-surface-container border border-[var(--border)] ${s.color}`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {s.icon}
                  </span>
                </div>
                {s.change && s.change !== "—" && (
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                    {s.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
                <p className="text-2xl font-mono font-medium text-on-surface">
                  {s.value}
                </p>
              </div>
            </Panel>
          ))
        )}
      </section>

      {showCharts && (
        <div className="grid grid-cols-12 gap-4">
          <Panel className="col-span-12 lg:col-span-8">
            <h2 className="font-headline text-base text-on-surface tracking-tight mb-1">
              Focus trend
            </h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Minutes of deep work over the selected period.
            </p>
            {barData.some((b) => b.minutes > 0) ? (
              range === "week" ? (
                <FocusBarChart
                  points={barData.map((b) => ({
                    label: b.day,
                    value: b.minutes,
                  }))}
                />
              ) : (
                <FocusLineChart
                  points={barData.map((b) => ({
                    label: b.day,
                    value: b.minutes,
                  }))}
                />
              )
            ) : (
              <p className="text-sm text-on-surface-variant py-10 text-center">
                No sessions in this period yet.
              </p>
            )}
          </Panel>

          <Panel className="col-span-12 lg:col-span-4 flex flex-col">
            <h2 className="font-headline text-base text-on-surface tracking-tight mb-4">
              Project mix
            </h2>
            {byProject.some((p) => p.focusMinutes > 0) ? (
              <ProjectDonut
                slices={byProject
                  .filter((p) => p.focusMinutes > 0)
                  .map((p) => ({
                    label: p.name,
                    value: p.focusMinutes,
                    color: p.color || "#2d6a5e",
                  }))}
              />
            ) : (
              <p className="text-sm text-on-surface-variant py-8">
                Link sessions to projects to see allocation.
              </p>
            )}
            {highlights.peakHours && (
              <p className="text-sm text-on-surface-variant leading-relaxed mt-6 pt-4 border-t border-[var(--border)]">
                Peak focus{" "}
                <span className="text-on-surface font-medium">
                  {highlights.peakHours.start}
                </span>{" "}
                –{" "}
                <span className="text-on-surface font-medium">
                  {highlights.peakHours.end}
                </span>
              </p>
            )}
          </Panel>

          {hasHeatmapActivity && (
            <Panel className="col-span-12">
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
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-md ${
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
            </Panel>
          )}

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
                  {highlights.bestDay && highlights.bestDay !== "—"
                    ? highlights.bestDay
                    : "—"}
                </p>
              </div>
            </Panel>
            <Panel className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-secondary/10 border border-[var(--border)] flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  stars
                </span>
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
      )}

      {!showCharts && byProject.length > 0 && (
        <Panel>
          <h2 className="font-headline text-base text-on-surface tracking-tight mb-4">
            By project
          </h2>
          <div className="flex flex-col gap-2">
            {byProject.map((p) => (
              <Link
                key={p.projectId}
                href={`/projects/${p.projectId}`}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="flex-1 text-on-surface">{p.name}</span>
                <span className="font-mono text-on-surface-variant">
                  {p.focusMinutes}m · {p.tasksDone} tasks
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {showCharts && (
        <Panel>
          <div className="mb-6">
            <h2 className="font-headline text-base text-on-surface tracking-tight">
              Latest dev activity
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Commits tagged with [fd:goal] count toward project goals
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
                      <p className="text-xs text-on-surface-variant font-mono flex flex-wrap gap-x-2 gap-y-1 mt-0.5">
                        <span>{act.repo}</span>
                        {act.commitTag && (
                          <span className="text-primary">
                            [fd:{act.commitTag}]
                          </span>
                        )}
                        {act.attributed && (
                          <span className="text-secondary font-sans">
                            attributed
                          </span>
                        )}
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
                  No GitHub activity yet. Connect GitHub in Settings, then push
                  with [fd:tag].
                </p>
              </div>
            )}
          </div>
        </Panel>
      )}
    </main>
    </FadeIn>
  );
}
