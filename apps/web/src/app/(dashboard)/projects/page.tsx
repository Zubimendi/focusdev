"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface ProjectSummary {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  color: string;
  status: "active" | "paused" | "archived";
  githubRepoFullName?: string;
  githubRepo?: string;
  focusMinutes?: number;
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
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#818cf8",
  });

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProjects(
        (data.projects || []).map((p: ProjectSummary) => ({
          ...p,
          id: p.id || String(p._id),
        }))
      );
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project created");
      setShowCreate(false);
      setForm({ name: "", description: "", color: "#818cf8" });
      await loadProjects();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const topProject = projects
    .filter((p) => p.status !== "archived")
    .sort((a, b) => (b.focusMinutes || 0) - (a.focusMinutes || 0))[0];
  const totalWeek = projects.reduce((a, p) => a + (p.focusMinutes || 0), 0);
  const topShare =
    topProject && totalWeek > 0
      ? Math.round(((topProject.focusMinutes || 0) / totalWeek) * 100)
      : 0;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12 flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded w-fit">
            Developer Workspace
          </label>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">
            Project Focus
          </h1>
          <p className="text-on-surface-variant max-w-lg">
            Track deep work across your projects and see where your engineering
            energy goes each week.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">
            add
          </span>
          New Project
        </button>
      </header>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col gap-4"
        >
          <h2 className="text-lg font-bold text-on-surface">Create Project</h2>
          <input
            className="w-full bg-surface-container-lowest rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <textarea
            className="w-full bg-surface-container-lowest rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface resize-none"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Color
            </label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 bg-surface-container-low rounded-2xl"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-2xl gap-4">
          <span className="material-symbols-outlined text-5xl text-outline-variant">
            folder_open
          </span>
          <p className="text-on-surface-variant font-medium">
            No projects yet. Create one to start tracking.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm"
          >
            New Project
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hover:bg-surface-container-high transition-all group flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/20"
                  style={{ backgroundColor: project.color }}
                >
                  <span className="material-symbols-outlined text-white">
                    folder
                  </span>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    project.status === "active"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {project.status}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {(project.githubRepoFullName || project.githubRepo) && (
                  <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-sm">
                      link
                    </span>
                    {project.githubRepoFullName || project.githubRepo}
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Focus This Week
                  </span>
                  <span className="text-xl font-mono font-bold text-on-surface">
                    {formatFocusTime(project.focusMinutes || 0)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Tasks
                  </span>
                  <span className="text-sm font-mono font-bold text-on-surface">
                    {project.taskCounts?.done || 0}/
                    {project.taskCounts?.total || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <button
            onClick={() => setShowCreate(true)}
            className="bg-surface-container-low/40 rounded-2xl p-6 border-2 border-dashed border-white/5 hover:border-indigo-500/20 hover:bg-surface-container-low transition-all flex flex-col items-center justify-center gap-4 text-on-surface-variant group h-full min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors">
                add
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
              Add Project
            </span>
          </button>
        </section>
      )}

      {topProject && totalWeek > 0 && (
        <section className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/10 p-8 rounded-3xl border border-indigo-500/10 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <span className="material-symbols-outlined text-4xl text-indigo-400">
              insights
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Engineering Analysis
            </h2>
            <p className="text-slate-400 max-w-xl">
              You&apos;ve spent{" "}
              <span className="text-indigo-400 font-bold">{topShare}%</span> of
              your focus time this week on{" "}
              <span className="text-on-surface font-semibold underline decoration-indigo-500/50 underline-offset-4">
                {topProject.name}
              </span>
              .
            </p>
          </div>
          <Link
            href={`/projects/${topProject.id}`}
            className="px-6 py-2 bg-on-secondary-container-fixed text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary/5 transition-all text-sm uppercase tracking-wider"
          >
            View Detail
          </Link>
        </section>
      )}
    </main>
  );
}
