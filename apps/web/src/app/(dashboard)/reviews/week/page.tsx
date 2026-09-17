"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  periodStart?: string;
  periodEnd?: string;
}

function formatFocusTime(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WeeklyReviewPage() {
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
      const res = await fetch("/api/reviews?periodType=week&current=true");
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
      toast.error("Failed to load weekly review");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateGoalScore = (
    goalId: string,
    patch: Partial<GoalScore>
  ) => {
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
      toast.success("Weekly review saved");
      await load();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const addWeeklyGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const body: Record<string, unknown> = {
        title: newGoalTitle,
        periodType: "week",
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
      toast.success("Weekly OKR added");
      await load();
    } catch {
      toast.error("Failed to add goal");
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-8 py-12 animate-pulse flex flex-col gap-6">
        <div className="h-12 w-64 bg-surface-container-low rounded-xl" />
        <div className="h-32 bg-surface-container-low rounded-2xl" />
        <div className="h-64 bg-surface-container-low rounded-2xl" />
      </main>
    );
  }

  if (!review) {
    return (
      <main className="max-w-3xl mx-auto px-8 py-12">
        <p className="text-on-surface-variant">Could not load review.</p>
      </main>
    );
  }

  const periodLabel =
    period?.start && period?.end
      ? `${new Date(period.start).toLocaleDateString()} – ${new Date(period.end).toLocaleDateString()}`
      : "This week";

  return (
    <main className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link href="/stats" className="hover:text-primary">
            Stats
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Weekly Review</span>
        </div>
        <h1 className="text-4xl font-black text-on-surface tracking-tight">
          Weekly Review
        </h1>
        <p className="text-on-surface-variant">{periodLabel}</p>
      </header>

      {/* Quant snapshot */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Focus", value: formatFocusTime(review.focusMinutes) },
          { label: "Sessions", value: String(review.sessionCount) },
          { label: "Tasks Done", value: String(review.tasksDone) },
          { label: "Streak", value: `${review.streak}d` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-low p-5 rounded-xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-mono font-bold text-on-surface">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {review.byProject?.length > 0 && (
        <section className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-3">
          <h2 className="text-lg font-bold text-on-surface">By Project</h2>
          {review.byProject.map((p) => (
            <div
              key={p.projectId}
              className="flex items-center gap-3 text-sm"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color || "#818cf8" }}
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
        </section>
      )}

      {/* OKR scoring */}
      <section className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4">
        <h2 className="text-lg font-bold text-on-surface">Period Goals / OKRs</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No goals for this week yet. Add one below.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((g) => {
              const score = goalScores.find((gs) => gs.goalId === g.id);
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl bg-surface-container-highest/40 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-on-surface text-sm">
                        {g.title}
                      </h3>
                      {g.targetValue != null && (
                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                          Target: {g.targetValue} {g.unit || ""}
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
                              score: st === "met" ? 100 : st === "failed" ? 0 : score?.score,
                            })
                          }
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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

        <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Add weekly OKR
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 bg-surface-container-lowest rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm"
              placeholder="Goal title"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <input
              className="w-24 bg-surface-container-lowest rounded-lg py-2.5 px-3 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm"
              placeholder="Target"
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
            />
            <select
              value={newGoalUnit}
              onChange={(e) => setNewGoalUnit(e.target.value)}
              className="bg-surface-container-lowest rounded-lg py-2.5 px-3 outline-none text-on-surface text-sm"
            >
              <option value="hours">hours</option>
              <option value="tasks">tasks</option>
              <option value="%">%</option>
            </select>
            <button
              onClick={addWeeklyGoal}
              className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* Reflection */}
      <section className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-5">
        <h2 className="text-lg font-bold text-on-surface">Reflection</h2>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Wins
          </label>
          <textarea
            className="w-full bg-surface-container-lowest rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder="What went well this week?"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Blockers
          </label>
          <textarea
            className="w-full bg-surface-container-lowest rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder="What got in the way?"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Next Period Goals
          </label>
          <textarea
            className="w-full bg-surface-container-lowest rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm resize-none min-h-[88px]"
            placeholder="What will you focus on next week?"
            value={nextPeriodGoals}
            onChange={(e) => setNextPeriodGoals(e.target.value)}
          />
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-wider"
      >
        {saving ? "Saving…" : "Save Weekly Review"}
      </button>
    </main>
  );
}
