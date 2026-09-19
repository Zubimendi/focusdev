"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

interface GoalScore {
  goalId: string;
  status: "open" | "met" | "failed";
  score?: number;
}

interface Goal {
  id: string;
  title: string;
  status: "open" | "met" | "failed";
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  periodType?: string;
}

interface ReviewData {
  id: string;
  focusMinutes: number;
  sessionCount: number;
  tasksDone: number;
  streak: number;
  wins?: string;
  blockers?: string;
  nextPeriodGoals?: string;
  goalScores: GoalScore[];
  byProject: {
    projectId: string;
    name?: string;
    color?: string;
    focusMinutes: number;
    tasksDone: number;
  }[];
}

function formatFocusTime(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function PeriodReview({
  periodType,
}: {
  periodType: "week" | "month";
}) {
  const isMonth = periodType === "month";
  const title = isMonth ? "Monthly review" : "Weekly review";
  const [review, setReview] = useState<ReviewData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [period, setPeriod] = useState<{ start: string; end: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextPeriodGoals, setNextPeriodGoals] = useState("");
  const [goalScores, setGoalScores] = useState<GoalScore[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalUnit, setNewGoalUnit] = useState("hours");

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reviews?periodType=${periodType}&current=true`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const r = data.review;
      setReview({ ...r, id: r.id || String(r._id) });
      setGoals(data.goals || []);
      setPeriod(data.period);
      setWins(r.wins || "");
      setBlockers(r.blockers || "");
      setNextPeriodGoals(r.nextPeriodGoals || "");

      const scores: GoalScore[] =
        (data.goals || []).map((g: Goal) => {
          const existing = (r.goalScores || []).find(
            (gs: GoalScore) => String(gs.goalId) === g.id
          );
          return {
            goalId: g.id,
            status: existing?.status || g.status || "open",
            score: existing?.score,
          };
        }) || [];
      setGoalScores(scores);
    } catch {
      toast.error(`Failed to load ${isMonth ? "monthly" : "weekly"} review`);
    } finally {
      setLoading(false);
    }
  }, [periodType, isMonth]);

  useEffect(() => {
    load();
  }, [load]);

  const updateGoalScore = (goalId: string, patch: Partial<GoalScore>) => {
    setGoalScores((prev) =>
      prev.map((gs) => (gs.goalId === goalId ? { ...gs, ...patch } : gs))
    );
  };

  const save = async () => {
    if (!review) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wins,
          blockers,
          nextPeriodGoals,
          goalScores,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${title} saved`);
      await load();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const addPeriodGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const body: Record<string, unknown> = {
        title: newGoalTitle,
        periodType,
        periodStart: period?.start,
        status: "open",
      };
      if (newGoalTarget) {
        body.targetValue = Number(newGoalTarget);
        body.currentValue = 0;
        body.unit = newGoalUnit;
      }
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      setNewGoalTitle("");
      setNewGoalTarget("");
      toast.success("Goal added");
      await load();
    } catch {
      toast.error("Failed to add goal");
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-8 lg:px-10 animate-pulse flex flex-col gap-6">
        <div className="h-12 w-64 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
        <div className="h-32 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
        <div className="h-64 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
      </main>
    );
  }

  if (!review) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-8 lg:px-10">
        <p className="text-on-surface-variant">Could not load review.</p>
      </main>
    );
  }

  const periodLabel =
    period?.start && period?.end
      ? `${new Date(period.start).toLocaleDateString()} – ${new Date(period.end).toLocaleDateString()}`
      : isMonth
        ? "This month"
        : "This week";

  const otherHref = isMonth ? "/reviews/week" : "/reviews/month";
  const otherLabel = isMonth ? "Weekly review" : "Monthly review";

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8 w-full">
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
        <Link href="/stats" className="hover:text-primary">
          Stats
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span>{title}</span>
        <span className="ml-auto">
          <Link href={otherHref} className="text-primary hover:underline text-xs font-medium">
            {otherLabel} →
          </Link>
        </span>
      </div>
      <PageHeader title={title} description={periodLabel} />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Focus", value: formatFocusTime(review.focusMinutes) },
          { label: "Sessions", value: String(review.sessionCount) },
          { label: "Tasks done", value: String(review.tasksDone) },
          { label: "Streak", value: `${review.streak}d` },
        ].map((s) => (
          <Panel key={s.label} className="!p-4">
            <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
            <p className="text-xl font-mono font-medium text-on-surface">
              {s.value}
            </p>
          </Panel>
        ))}
      </section>

      {review.byProject?.length > 0 && (
        <Panel className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-on-surface">By project</h2>
          {review.byProject.map((p) => (
            <div key={p.projectId} className="flex items-center gap-3 text-sm">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color || "#2d6a5e" }}
              />
              <span className="flex-1 font-medium text-on-surface">
                {p.name || "Project"}
              </span>
              <span className="font-mono text-on-surface-variant">
                {formatFocusTime(p.focusMinutes)}
              </span>
              <span className="text-xs text-on-surface-variant">
                {p.tasksDone} done
              </span>
            </div>
          ))}
        </Panel>
      )}

      <Panel className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-on-surface">Period goals</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No goals for this {isMonth ? "month" : "week"} yet. Add one below.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((g) => {
              const score = goalScores.find((gs) => gs.goalId === g.id);
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-md border border-[var(--border)] bg-surface-container-low flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-on-surface text-sm">
                        {g.title}
                      </h3>
                      {g.targetValue != null && (
                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                          {g.currentValue ?? 0} / {g.targetValue} {g.unit || ""}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {(["open", "met", "failed"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() =>
                            updateGoalScore(g.id, {
                              status: st,
                              score:
                                st === "met"
                                  ? 100
                                  : st === "failed"
                                    ? 0
                                    : score?.score,
                            })
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            score?.status === st
                              ? st === "met"
                                ? "bg-secondary text-on-secondary"
                                : st === "failed"
                                  ? "bg-error text-on-error"
                                  : "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-on-surface-variant">
                      Score
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={score?.score ?? (score?.status === "met" ? 100 : 0)}
                      onChange={(e) =>
                        updateGoalScore(g.id, {
                          score: Number(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm font-mono font-bold text-on-surface w-10 text-right">
                      {score?.score ?? (score?.status === "met" ? 100 : 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2">
          <p className="text-xs text-on-surface-variant">
            Add {isMonth ? "monthly" : "weekly"} goal
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm"
              placeholder="Goal title"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <input
              className="w-24 h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm"
              placeholder="Target"
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
            />
            <select
              value={newGoalUnit}
              onChange={(e) => setNewGoalUnit(e.target.value)}
              className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none text-on-surface text-sm"
            >
              <option value="hours">hours</option>
              <option value="tasks">tasks</option>
              <option value="commits">commits</option>
              <option value="%">%</option>
            </select>
            <Button type="button" size="sm" onClick={addPeriodGoal}>
              Add
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <h2 className="text-sm font-medium text-on-surface">Reflection</h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-on-surface-variant">Wins</label>
          <textarea
            className="w-full px-3 py-2 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder={`What went well this ${isMonth ? "month" : "week"}?`}
            value={wins}
            onChange={(e) => setWins(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-on-surface-variant">Blockers</label>
          <textarea
            className="w-full px-3 py-2 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder="What got in the way?"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-on-surface-variant">
            Next period focus
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder={`What will you focus on next ${isMonth ? "month" : "week"}?`}
            value={nextPeriodGoals}
            onChange={(e) => setNextPeriodGoals(e.target.value)}
          />
        </div>
      </Panel>

      <Button onClick={save} disabled={saving} className="w-full h-10">
        {saving ? "Saving…" : `Save ${isMonth ? "monthly" : "weekly"} review`}
      </Button>
    </main>
  );
}
