"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { formatCommitTemplate } from "@/lib/github-goal-tags";

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
  commitTag?: string;
}

interface Contribution {
  id: string;
  sha: string;
  message: string;
  commitTag: string;
  htmlUrl?: string;
  committedAt: string;
  goalId: string;
}

interface GhRepo {
  id: number;
  full_name: string;
  private: boolean;
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

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [startingFocus, setStartingFocus] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("10");
  const [newGoalTag, setNewGoalTag] = useState("");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [repos, setRepos] = useState<GhRepo[]>([]);
  const [linkingRepo, setLinkingRepo] = useState(false);
  const [showRepoPicker, setShowRepoPicker] = useState(false);

  const loadContributions = useCallback(async () => {
    try {
      const res = await fetch(`/api/github/contributions?projectId=${id}&limit=30`);
      if (!res.ok) return;
      const data = await res.json();
      setContributions(data.contributions || []);
    } catch {
      // ignore
    }
  }, [id]);

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
      await loadContributions();
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id, router, loadContributions]);

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

  const openRepoPicker = async () => {
    setShowRepoPicker(true);
    if (repos.length > 0) return;
    try {
      const res = await fetch("/api/github/repos");
      if (res.status === 401) {
        toast.error("Sign in with GitHub once to link repositories.");
        setShowRepoPicker(false);
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Could not load GitHub repos");
      setShowRepoPicker(false);
    }
  };

  const linkRepo = async (repo: GhRepo) => {
    setLinkingRepo(true);
    try {
      const res = await fetch(`/api/projects/${id}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepoId: repo.id,
          githubRepoFullName: repo.full_name,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setProject((p) =>
        p ? { ...p, githubRepoFullName: repo.full_name } : p
      );
      setShowRepoPicker(false);
      toast.success(`Linked ${repo.full_name}`);
    } catch {
      toast.error("Failed to link repository");
    } finally {
      setLinkingRepo(false);
    }
  };

  const createGoal = async () => {
    if (!newGoalTitle.trim()) return;
    setCreatingGoal(true);
    try {
      const payload: Record<string, unknown> = {
        title: newGoalTitle.trim(),
        projectId: id,
        targetValue: Number(newGoalTarget) || 10,
        currentValue: 0,
        unit: "commits",
        status: "open",
      };
      if (newGoalTag.trim()) {
        payload.commitTag = newGoalTag
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "");
      }
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setNewGoalTitle("");
      setNewGoalTag("");
      setNewGoalTarget("10");
      toast.success("Goal created — use its [fd:tag] in commits");
      await load();
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setCreatingGoal(false);
    }
  };

  const syncGithub = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const r = data.result;
      if (r.errors?.length && r.newContributions === 0) {
        toast.error(r.errors[0]);
      } else {
        toast.success(
          r.newContributions > 0
            ? `Attributed ${r.newContributions} new commit${r.newContributions === 1 ? "" : "s"}`
            : `Scanned ${r.scanned} commits — nothing new to attribute`
        );
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const copyTemplate = async (tag: string) => {
    const text = formatCommitTemplate(tag);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Commit template copied");
    } catch {
      toast.message(text);
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

  const goalTitleById = Object.fromEntries(goals.map((g) => [g.id, g.title]));

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
            <div className="flex items-center gap-2 flex-wrap">
              {project.githubRepoFullName ? (
                <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">link</span>
                  {project.githubRepoFullName}
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  No GitHub repo linked
                </p>
              )}
              <button
                type="button"
                onClick={openRepoPicker}
                className="text-xs font-medium text-primary hover:underline"
              >
                {project.githubRepoFullName ? "Change repo" : "Link repo"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={syncGithub}
            disabled={syncing || !project.githubRepoFullName}
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            {syncing ? "Syncing…" : "Sync commits"}
          </Button>
          <Button onClick={startFocus} disabled={startingFocus}>
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            {startingFocus ? "Starting…" : "Start focus"}
          </Button>
        </div>
      </header>

      {showRepoPicker && (
        <Panel className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-on-surface">
              Link a GitHub repository
            </h2>
            <button
              type="button"
              className="text-xs text-on-surface-variant hover:text-on-surface"
              onClick={() => setShowRepoPicker(false)}
            >
              Close
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto flex flex-col gap-1">
            {repos.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">
                Loading repositories…
              </p>
            ) : (
              repos.map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  disabled={linkingRepo}
                  onClick={() => linkRepo(repo)}
                  className="text-left px-3 py-2 rounded-md hover:bg-surface-container-high text-sm font-mono text-on-surface transition-colors"
                >
                  {repo.full_name}
                  {repo.private ? (
                    <span className="ml-2 text-xs text-on-surface-variant font-sans">
                      private
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </Panel>
      )}

      <Panel className="flex flex-col gap-3 !p-5">
        <h2 className="text-sm font-medium text-on-surface">
          Goal-linked commits
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Structure pushes so FocusDev can credit them. Put{" "}
          <code className="font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded">
            [fd:tag]
          </code>{" "}
          in the commit subject — the tag must match a goal on this project.
          Example:{" "}
          <code className="font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded">
            [fd:career] Add rate limiting to login
          </code>
        </p>
      </Panel>

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
            label: "Attributed commits",
            value: String(contributions.length),
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
          <h2 className="text-sm font-medium text-on-surface">
            Goals &amp; commit tags
          </h2>
          <div className="flex flex-col gap-2">
            <input
              className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary text-on-surface text-sm"
              placeholder="Goal title (e.g. Ship auth hardening)"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary text-on-surface text-sm font-mono"
                placeholder="tag (optional — auto from title)"
                value={newGoalTag}
                onChange={(e) => setNewGoalTag(e.target.value)}
              />
              <input
                className="w-20 h-9 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary text-on-surface text-sm font-mono"
                type="number"
                min={1}
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                title="Target commit count"
              />
              <Button
                type="button"
                size="sm"
                onClick={createGoal}
                disabled={creatingGoal}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-6 text-center">
                Create a goal to get a commit tag for this repo.
              </p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-md border border-[var(--border)] bg-surface-container-low flex flex-col gap-2"
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
                  {goal.commitTag && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        [fd:{goal.commitTag}]
                      </code>
                      <button
                        type="button"
                        onClick={() => copyTemplate(goal.commitTag!)}
                        className="text-xs text-on-surface-variant hover:text-primary"
                      >
                        Copy template
                      </button>
                    </div>
                  )}
                  {goal.targetValue != null && (
                    <p className="text-xs text-on-surface-variant font-mono">
                      {goal.currentValue ?? 0} / {goal.targetValue}{" "}
                      {goal.unit || "commits"}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-on-surface">
            Attributed contributions
          </h2>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={syncGithub}
            disabled={syncing || !project.githubRepoFullName}
          >
            {syncing ? "Syncing…" : "Refresh"}
          </Button>
        </div>
        {contributions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            No attributed commits yet. Push with{" "}
            <span className="font-mono text-xs">[fd:tag]</span> then sync.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contributions.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 p-3 rounded-md border border-[var(--border)] bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                  commit
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface truncate">
                    {c.htmlUrl ? (
                      <a
                        href={c.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary"
                      >
                        {c.message}
                      </a>
                    ) : (
                      c.message
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="font-mono">[fd:{c.commitTag}]</span>
                    <span>{goalTitleById[c.goalId] || "Goal"}</span>
                    <span className="font-mono">{c.sha.slice(0, 7)}</span>
                    <span>{relativeTime(c.committedAt)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </main>
  );
}
