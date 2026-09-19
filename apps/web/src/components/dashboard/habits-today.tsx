"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type HabitRow = {
  id: string;
  title: string;
  targetPerPeriod: number;
  todayValue: number;
  unit?: string;
};

export default function HabitsToday() {
  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (!res.ok) return;
      const data = await res.json();
      setHabits(data.habits || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}/check-in`, { method: "POST" });
      if (!res.ok) throw new Error("fail");
      await load();
    } catch {
      toast.error("Couldn’t update habit");
    }
  };

  const create = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), cadence: "daily" }),
      });
      if (!res.ok) throw new Error("fail");
      setTitle("");
      await load();
      toast.success("Habit added");
    } catch {
      toast.error("Couldn’t create habit");
    }
  };

  return (
    <section className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-on-surface">Today’s habits</h2>
        <span className="text-xs text-on-surface-variant">KPIs</span>
      </div>

      {loading ? (
        <div className="h-8 bg-surface-container rounded animate-pulse" />
      ) : habits.length === 0 ? (
        <p className="text-xs text-on-surface-variant">
          Track recurring practice (study, labs, applications).
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {habits.map((h) => {
            const done = h.todayValue >= h.targetPerPeriod;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => checkIn(h.id)}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-container text-left"
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    done ? "text-primary" : "text-on-surface-variant"
                  }`}
                  style={{
                    fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {done ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span className="text-sm text-on-surface flex-1 truncate">
                  {h.title}
                </span>
                <span className="text-xs font-mono text-on-surface-variant">
                  {h.todayValue}/{h.targetPerPeriod}
                  {h.unit ? ` ${h.unit}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <input
          className="flex-1 h-8 px-2 rounded-md border border-[var(--border)] bg-surface text-sm outline-none focus:border-primary"
          placeholder="New daily habit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button size="sm" variant="secondary" onClick={create}>
          Add
        </Button>
      </div>
    </section>
  );
}
