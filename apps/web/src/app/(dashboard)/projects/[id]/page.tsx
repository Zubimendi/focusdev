"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
}

interface Goal {
  id: string;
  title: string;
  status: "open" | "met" | "failed";
  targetValue?: number;
  currentValue?: number;
  unit?: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: "active" | "paused" | "archived";
  githubRepoFullName?: string;
  focusMinutes?: number;
  focusMinutesAll?: number;
  taskCounts?: {
    todo: number;
    in_progress: number;
    done: number;
    total: number;
  };
}

function formatFocusTime(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [startingFocus, setStartingFocus] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.status === 404) {
        toast.error("Project not found");
        router.push("/projects");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProject({ ...data.project, id: data.project.id || String(data.project._id) });
      setTasks(data.tasks || []);
      setGoals(data.goals || []);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status: ProjectDetail["status"]) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProject((p) => (p ? { ...p, status: data.project.status } : p));
      toast.success(`Marked ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const createTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask, projectId: id }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewTask("");
      toast.success("Task created");
      await load();
    } catch {
      toast.error("Failed to create task");
    }
  };

  const toggleTask = async (task: Task) => {
    const next =
      task.status === "done"
        ? "todo"
        : task.status === "todo"
          ? "in_progress"
          : "done";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      await load();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const startFocus = async () => {
    setStartingFocus(true);
    try {
      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Focus session started");
      router.push("/timer");
    } catch {
      toast.error("Failed to start focus session");
    } finally {
      setStartingFocus(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8 lg:px-10 animate-pulse flex flex-col gap-8">
        <div className="h-10 w-48 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
        <div className="h-40 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
        <div className="h-64 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)]" />
      </main>
    );
  }

  if (!project) return null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8 w-full">
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/projects" className="hover:text-primary transition-colors">
          Projects
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface">{project.name}</span>
      </div>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 border border-[var(--border)]"
            style={{ backgroundColor: project.color }}
          >
            <span className="material-symbols-outlined text-white text-2xl">
              folder
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline text-2xl text-on-surface tracking-tight">
                {project.name}
              </h1>
              <select
                value={project.status}
                onChange={(e) =>
                  updateStatus(e.target.value as ProjectDetail["status"])
                }
                className="h-8 px-2 rounded-md bg-surface border border-[var(--border)] text-xs font-medium outline-none text-on-surface capitalize"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {project.description && (
              <p className="text-on-surface-variant max-w-xl">
                {project.description}
              </p>
            )}
            {project.githubRepoFullName && (
              <p className="text-xs font-mono text-on-surface-variant opacity-70 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">link</span>
                {project.githubRepoFullName}
              </p>
            )}
          </div>
        </div>
        <Button onClick={startFocus} disabled={startingFocus}>
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          {startingFocus ? "Starting…" : "Start focus"}
        </Button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Focus This Week",
            value: formatFocusTime(project.focusMinutes || 0),
          },
          {
            label: "All-Time Focus",
            value: formatFocusTime(project.focusMinutesAll || 0),
          },
          {
            label: "Open Tasks",
            value: String(
              (project.taskCounts?.todo || 0) +
                (project.taskCounts?.in_progress || 0)
            ),
          },
          {
            label: "Done",
            value: String(project.taskCounts?.done || 0),
          },
        ].map((stat) => (
          <Panel key={stat.label} className="!p-4">
            <p className="text-xs text-on-surface-variant mb-1">{stat.label}</p>
            <p className="text-xl font-mono font-medium text-on-surface">
              {stat.value}
            </p>
          </Panel>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-on-surface">Tasks</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm"
              placeholder="Add a task…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTask()}
            />
            <Button type="button" size="sm" onClick={createTask}>
              Add
            </Button>
          </div>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-6 text-center">
                No tasks yet
              </p>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-high text-left transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      task.status === "done"
                        ? "text-secondary"
                        : task.status === "in_progress"
                          ? "text-primary"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {task.status === "done"
                      ? "check_circle"
                      : task.status === "in_progress"
                        ? "pending"
                        : "radio_button_unchecked"}
                  </span>
                  <span
                    className={`text-sm font-medium flex-1 ${
                      task.status === "done"
                        ? "line-through text-on-surface-variant"
                        : "text-on-surface"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs text-on-surface-variant capitalize">
                    {task.priority}
                  </span>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-on-surface">Goals</h2>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-6 text-center">
                No goals linked to this project. Add them from Checklists or
                Weekly Review.
              </p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-md border border-[var(--border)] bg-surface-container-low flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-on-surface text-sm">
                      {goal.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        goal.status === "met"
                          ? "bg-secondary/20 text-secondary"
                          : goal.status === "failed"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  {goal.targetValue != null && (
                    <p className="text-xs text-on-surface-variant font-mono">
                      {goal.currentValue ?? 0} / {goal.targetValue}{" "}
                      {goal.unit || ""}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <Link
            href="/reviews/week"
            className="text-sm font-bold text-primary hover:underline mt-auto"
          >
            Score goals in Weekly Review →
          </Link>
        </Panel>
      </div>
    </main>
  );
}
