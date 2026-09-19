"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FocusTimer from "@/components/dashboard/focus-timer";
import DailyChecklist from "@/components/dashboard/daily-checklist";
import HabitsToday from "@/components/dashboard/habits-today";
import { toast } from "sonner";
import { calculateStreak } from "@/lib/streak";

interface DashboardStats {
  sessionsToday: number;
  focusMinutesToday: number;
  taskTitle: string;
  projectId: string;
}

interface ProjectOption {
  id: string;
  name: string;
  color: string;
  focusMinutes?: number;
}

interface OpenTask {
  id: string;
  _id?: string;
  title: string;
  status: string;
  projectId?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sessionsToday: 0,
    focusMinutesToday: 0,
    taskTitle: "",
    projectId: "",
  });
  const [allSessions, setAllSessions] = useState<
    { startTime: string | Date; duration?: number }[]
  >([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [openTasks, setOpenTasks] = useState<OpenTask[]>([]);
  const [reviewDue, setReviewDue] = useState<"week" | "month" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [sessionsRes, projectsRes, tasksRes] = await Promise.all([
            fetch("/api/focus/sessions"),
            fetch("/api/projects?status=active"),
            fetch("/api/tasks"),
          ]);

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          const sessions = sessionsData.sessions || [];
          setAllSessions(sessions);
          const today = new Date().toDateString();
          const todaySessions = sessions.filter(
            (s: { startTime: string | Date }) =>
              new Date(s.startTime).toDateString() === today
          );
          const todayMinutes = todaySessions.reduce(
            (sum: number, s: { duration?: number }) => sum + (s.duration || 0),
            0
          );
          setStats((prev) => ({
            ...prev,
            sessionsToday: todaySessions.length,
            focusMinutesToday: todayMinutes,
          }));
        }

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(
            (data.projects || []).map(
              (p: { id?: string; _id?: string; name: string; color: string; focusMinutes?: number }) => ({
                id: p.id || String(p._id),
                name: p.name,
                color: p.color,
                focusMinutes: p.focusMinutes || 0,
              })
            )
          );
        }

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setOpenTasks(
            (data.tasks || [])
              .filter((t: OpenTask) => t.status !== "done")
              .slice(0, 8)
              .map((t: OpenTask) => ({
                ...t,
                id: t.id || String(t._id),
              }))
          );
        }

        // Prompt if previous week has no saved reflection
        try {
          const now = new Date();
          const day = now.getDay();
          const isLateWeek = day === 0 || day >= 5;
          const isLateMonth = now.getDate() >= 25;
          let due: "week" | "month" | null = null;

          if (isLateWeek) {
            const weekRes = await fetch("/api/reviews?periodType=week");
            if (weekRes.ok) {
              const listData = await weekRes.json();
              const latest = (listData.reviews || [])[0];
              if (!(latest?.wins || latest?.blockers)) due = "week";
            }
          }
          if (!due && isLateMonth) {
            const monthRes = await fetch("/api/reviews?periodType=month");
            if (monthRes.ok) {
              const listData = await monthRes.json();
              const latest = (listData.reviews || [])[0];
              if (!(latest?.wins || latest?.blockers)) due = "month";
            }
          }
          setReviewDue(due);
        } catch {
          /* ignore */
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
        body: JSON.stringify({
          title: stats.taskTitle,
          ...(stats.projectId ? { projectId: stats.projectId } : {}),
        }),
      });
      if (res.ok) {
        toast.success(`Task "${stats.taskTitle}" created!`);
        setStats((prev) => ({ ...prev, taskTitle: "" }));
        const data = await res.json();
        const task = data.task;
        setOpenTasks((prev) => [
          {
            id: task.id || String(task._id),
            title: task.title,
            status: task.status,
            projectId: task.projectId,
          },
          ...prev,
        ].slice(0, 8));
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

  const projectName = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-5 order-1 md:order-2 min-w-0">
        {reviewDue && (
          <Link
            href={reviewDue === "month" ? "/reviews/month" : "/reviews/week"}
            className="border border-[var(--border)] bg-surface-container-lowest rounded-md px-4 py-3 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-primary text-[20px]">
                rate_review
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface">
                  {reviewDue === "month"
                    ? "Monthly review ready"
                    : "Weekly review ready"}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  Close the {reviewDue === "month" ? "month" : "week"} with
                  metrics and a short reflection.
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary shrink-0">
              Review →
            </span>
          </Link>
        )}

        <FocusTimer />

        <HabitsToday />

        <section className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex flex-col gap-4">
          <label className="text-xs font-medium text-on-surface-variant">
            Active mission
          </label>
          <input
            className="w-full h-10 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="What are you working on?"
            type="text"
            value={stats.taskTitle}
            onChange={(e) =>
              setStats((prev) => ({ ...prev, taskTitle: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
          />
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStats((prev) => ({ ...prev, projectId: "" }))}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  !stats.projectId
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                No project
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setStats((prev) => ({ ...prev, projectId: p.id }))
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    stats.projectId === p.id
                      ? "text-white"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                  style={
                    stats.projectId === p.id
                      ? { backgroundColor: p.color }
                      : undefined
                  }
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleCreateTask}
            className="h-9 rounded-md bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Create task
          </button>
        </section>

        {projects.length > 0 && (
          <section className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-on-surface">
                This week by project
              </h2>
              <Link
                href="/projects"
                className="text-xs font-medium text-primary hover:underline"
              >
                All projects
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-surface-container transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-sm text-on-surface flex-1 truncate">
                    {p.name}
                  </span>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {formatFocusTime(p.focusMinutes || 0)}
                  </span>
                </Link>
              ))}
            </div>
            {openTasks.length > 0 && (
              <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-1">
                <p className="text-xs text-on-surface-variant mb-1">
                  Open tasks
                </p>
                {openTasks.slice(0, 5).map((t) => {
                  const proj = projectName(
                    t.projectId ? String(t.projectId) : undefined
                  );
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-sm text-on-surface px-1"
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        check_box_outline_blank
                      </span>
                      <span className="flex-1 truncate">{t.title}</span>
                      {proj && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded text-white shrink-0"
                          style={{ backgroundColor: proj.color }}
                        >
                          {proj.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: "Sessions today",
              value: loading ? null : String(stats.sessionsToday),
            },
            {
              label: "Focus time",
              value: loading
                ? null
                : formatFocusTime(stats.focusMinutesToday),
            },
            {
              label: "Streak",
              value: loading
                ? null
                : `${calculateStreak(allSessions)}d`,
              accent: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-4"
            >
              <span className="text-xs text-on-surface-variant">
                {stat.label}
              </span>
              <div className="mt-1">
                {stat.value === null ? (
                  <div className="h-7 w-12 bg-surface-container rounded animate-pulse" />
                ) : (
                  <span
                    className={`text-2xl font-mono font-medium ${
                      stat.accent ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {stat.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>

      <DailyChecklist />
    </main>
  );
}
