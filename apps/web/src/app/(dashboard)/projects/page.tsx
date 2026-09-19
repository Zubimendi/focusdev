"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/motion";

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
    color: "#2d6a5e",
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
      setForm({ name: "", description: "", color: "#2d6a5e" });
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
    <FadeIn>
    <main className="max-w-6xl mx-auto px-6 py-8 lg:px-10 w-full flex flex-col gap-8">
      <PageHeader
        title="Projects"
        description="Track deep work across your projects and see where your engineering energy goes each week."
        actions={
          <Button type="button" onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            New project
          </Button>
        }
      />

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-5 flex flex-col gap-4"
        >
          <h2 className="text-sm font-medium text-on-surface">Create project</h2>
          <input
            className="w-full h-10 px-3 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <textarea
            className="w-full px-3 py-2 rounded-md bg-surface border border-[var(--border)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-on-surface text-sm resize-none"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <div className="flex items-center gap-3">
            <label className="text-xs text-on-surface-variant">Color</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-9 h-9 rounded-md cursor-pointer bg-transparent border border-[var(--border)]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating} disabled={creating}>
              Create
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Panel className="py-16 flex flex-col items-center justify-center gap-4 border-dashed">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            folder_open
          </span>
          <p className="text-sm text-on-surface-variant">
            No projects yet. Create one to start tracking.
          </p>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            New project
          </Button>
        </Panel>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-5 hover:bg-surface-container-low transition-colors group flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: project.color }}
                >
                  <span className="material-symbols-outlined text-white text-[20px]">
                    folder
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md border border-[var(--border)] ${
                    project.status === "active"
                      ? "text-secondary bg-secondary/5"
                      : "text-on-surface-variant bg-surface-container"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                {(project.githubRepoFullName || project.githubRepo) && (
                  <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-sm shrink-0">
                      link
                    </span>
                    {project.githubRepoFullName || project.githubRepo}
                  </p>
                )}
                {project.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-on-surface-variant">
                    Focus this week
                  </span>
                  <span className="text-lg font-mono font-medium text-on-surface">
                    {formatFocusTime(project.focusMinutes || 0)}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-on-surface-variant">Tasks</span>
                  <span className="text-sm font-mono font-medium text-on-surface">
                    {project.taskCounts?.done || 0}/
                    {project.taskCounts?.total || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-5 border border-dashed border-[var(--border)] hover:bg-surface-container-low hover:border-primary/30 transition-colors flex flex-col items-center justify-center gap-3 text-on-surface-variant min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-md bg-surface-container-high border border-[var(--border)] flex items-center justify-center group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </div>
            <span className="text-xs font-medium">Add project</span>
          </button>
        </section>
      )}

      {topProject && totalWeek > 0 && (
        <Panel className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="w-10 h-10 rounded-md bg-primary/10 border border-[var(--border)] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">
              insights
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <h2 className="font-headline text-base text-on-surface tracking-tight">
              Focus breakdown
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl">
              You&apos;ve spent{" "}
              <span className="text-primary font-medium">{topShare}%</span> of
              your focus time this week on{" "}
              <span className="text-on-surface font-medium">{topProject.name}</span>
              .
            </p>
          </div>
          <Link
            href={`/projects/${topProject.id}`}
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-9 px-4 text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-[var(--border)] shrink-0"
          >
            View detail
          </Link>
        </Panel>
      )}
    </main>
    </FadeIn>
  );
}
