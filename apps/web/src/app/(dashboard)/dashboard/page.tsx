"use client";

import { useState, useEffect } from "react";
import FocusTimer from "@/components/dashboard/focus-timer";
import DailyChecklist from "@/components/dashboard/daily-checklist";
import { toast } from "sonner";

interface DashboardStats {
  sessionsToday: number;
  focusMinutesToday: number;
  taskTitle: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sessionsToday: 0,
    focusMinutesToday: 0,
    taskTitle: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [sessionsRes, tasksRes] = await Promise.all([
          fetch("/api/focus/sessions"),
          fetch("/api/tasks"),
        ]);

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          const sessions = sessionsData.sessions || [];
          const today = new Date().toDateString();
          const todaySessions = sessions.filter((s: any) => 
            new Date(s.startTime).toDateString() === today
          );
          const todayMinutes = todaySessions.reduce(
            (sum: number, s: any) => sum + (s.duration || 0), 0
          );
          setStats(prev => ({
            ...prev,
            sessionsToday: todaySessions.length,
            focusMinutesToday: todayMinutes,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleCreateTask = async () => {
    if (!stats.taskTitle.trim()) {
      toast.error("Enter a task name first");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: stats.taskTitle }),
      });
      if (res.ok) {
        toast.success(`Task "${stats.taskTitle}" created!`);
        setStats(prev => ({ ...prev, taskTitle: "" }));
      } else {
        toast.error("Failed to create task");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    }
  };

  const formatFocusTime = (minutes: number) => {
    if (minutes === 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const tags = ["Coding", "Learning", "Building", "Review", "Other"];

  return (
    <main className="max-w-[1920px] mx-auto px-8 py-12 flex flex-col lg:flex-row gap-8">
      {/* Main Center Content: Timer & Active Session */}
      <div className="flex-1 flex flex-col gap-8 order-1 md:order-2">
        {/* Hero Timer Section */}
        <FocusTimer />

        {/* Task Input Section */}
        <section className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">target</span>
              Active Mission
            </label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-lg py-4 px-6 text-xl placeholder:text-on-surface-variant/40 font-medium transition-all outline-none text-on-surface" 
                placeholder="What are you working on?" 
                type="text"
                value={stats.taskTitle}
                onChange={(e) => setStats(prev => ({ ...prev, taskTitle: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button 
                key={tag}
                onClick={() => setStats(prev => ({ ...prev, taskTitle: tag }))}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  stats.taskTitle === tag 
                    ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/10 hover:text-on-surface'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <button 
            onClick={handleCreateTask}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider"
          >
            Create Task
          </button>
        </section>

        {/* Bottom Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sessions Today</span>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-9 w-12 bg-surface-container-high rounded animate-pulse" />
              ) : (
                <span className="text-3xl font-mono font-bold text-on-surface">{stats.sessionsToday}</span>
              )}
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Focus Time</span>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-9 w-20 bg-surface-container-high rounded animate-pulse" />
              ) : (
                <span className="text-3xl font-mono font-bold text-on-surface">{formatFocusTime(stats.focusMinutesToday)}</span>
              )}
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Current Streak</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-primary">12 days</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Sidebar: Checklist */}
      <DailyChecklist />
    </main>
  );
}
