"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  projectId?: string;
  goalId?: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  color: string;
}

interface Goal {
  _id: string;
  id?: string;
  title: string;
  status: string;
  targetValue?: number;
  currentValue?: number;
}

export default function ChecklistsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    projectId: "",
    goalId: ""
  });

  const fetchData = useCallback(async () => {
    try {
      const [tRes, pRes, gRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
        fetch("/api/goals")
      ]);

      if (tRes.ok) {
        const data = await tRes.json();
        setTasks(data.tasks || []);
      }
      if (pRes.ok) {
        const data = await pRes.json();
        setProjects(data.projects || []);
      }
      if (gRes.ok) {
        const data = await gRes.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(prev =>
          prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t)
        );
        if (newStatus === "done") toast.success(`Completed: ${task.title}`);
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [data.task, ...prev]);
        setNewTask({ title: "", description: "", priority: "medium", projectId: "", goalId: "" });
        toast.success(`Objective "${newTask.title}" initiated!`);
      }
    } catch {
      toast.error("Failed to create task");
    }
  };

  const deleteTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== task._id));
        toast.success(`Deleted: ${task.title}`);
      }
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const completedCount = tasks.filter(t => t.status === "done").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const highPriorityTasks = tasks.filter(t => t.priority === "high" && t.status !== "done");
  const todoTasks = tasks.filter(t => t.status === "todo");
  const doneTasks = tasks.filter(t => t.status === "done");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": return { color: "text-error", bg: "bg-error-container" };
      case "medium": return { color: "text-on-tertiary-container", bg: "bg-tertiary-container" };
      default: return { color: "text-outline", bg: "bg-surface-container-highest" };
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8 lg:px-10 w-full">
      <PageHeader
        title="Checklists"
        description="Tasks, goals, and daily completion."
        actions={
          loading ? (
            <div className="h-9 w-14 bg-surface-container-high rounded-md animate-pulse border border-[var(--border)]" />
          ) : (
            <span className="text-2xl font-mono font-medium text-on-surface">
              {progressPercent}%
            </span>
          )
        }
      />

      <div className="h-2 w-full bg-surface-container-low rounded-md overflow-hidden border border-[var(--border)] mb-8">
        <div
          className="h-full bg-secondary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <Panel>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">target</span>
              <h3 className="text-sm font-medium text-on-surface">Weekly focus</h3>
            </div>
            
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-sm text-outline italic">No active goals. Set direction in the Projects hub.</p>
              ) : (
                goals.map((goal) => {
                  const pct =
                    goal.status === "met"
                      ? 100
                      : goal.targetValue
                        ? Math.min(
                            100,
                            Math.round(
                              ((goal.currentValue || 0) / goal.targetValue) *
                                100
                            )
                          )
                        : 0;
                  return (
                  <div key={goal._id || goal.id} className="p-4 bg-surface-container rounded-lg border border-outline-variant/20">
                    <p className="text-sm font-bold text-on-surface mb-2">{goal.title}</p>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </Panel>

          <Panel>
             <h3 className="text-sm font-medium text-on-surface mb-4">New task</h3>
             <div className="space-y-4">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-outline focus:border-primary/50 focus:outline-none transition-all"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-outline focus:border-primary/50 focus:outline-none transition-all text-sm h-24 resize-none"
                  placeholder="Details/Sub-tasks..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />

                <div>
                  <label className="text-xs text-on-surface-variant block mb-2">Priority</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize ${
                          newTask.priority === p 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface border-[var(--border)] text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {projects.length > 0 && (
                  <div>
                    <label className="text-xs text-on-surface-variant block mb-2">Project</label>
                    <select
                      className="w-full h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-on-surface text-sm focus:border-primary focus:outline-none appearance-none"
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                    >
                      <option value="">No Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <Button 
                  type="button"
                  onClick={createTask}
                  disabled={!newTask.title.trim()}
                  className="w-full mt-4"
                >
                  Add task
                </Button>
             </div>
          </Panel>
        </section>

        <Panel className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">wb_sunny</span>
              <h3 className="text-sm font-medium text-on-surface">Active tasks</h3>
              <span className="text-xs text-on-surface-variant">{todoTasks.length + inProgressTasks.length} remaining</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-surface-container rounded-lg animate-pulse" />
              ))
            ) : [...inProgressTasks, ...todoTasks].length > 0 ? (
              [...inProgressTasks, ...todoTasks].map((task) => {
                const style = getPriorityStyle(task.priority);
                return (
                  <div key={task._id} className="group flex items-center gap-4 p-3 rounded-md border border-[var(--border)] bg-surface-container-low hover:bg-surface-container transition-colors">
                    <button 
                      onClick={() => toggleTask(task)}
                      className="w-6 h-6 border-2 border-outline rounded-full flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all"
                    >
                    </button>
                    <div className="flex-grow">
                      <p className="font-bold text-on-surface">{task.title}</p>
                      {task.description && <p className="text-xs text-outline line-clamp-1 mt-0.5">{task.description}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${style.bg} ${style.color}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error/80 px-2"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
                <p className="text-sm text-on-surface-variant">No active tasks. Add one above.</p>
              </div>
            )}
          </div>
        </Panel>

        <section className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                <h3 className="text-sm font-medium text-on-surface">Completed</h3>
              </div>
              <span className="text-xs text-on-surface-variant">{doneTasks.length} done</span>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {loading ? (
                [1, 2].map(i => (
                  <div key={i} className="h-14 bg-surface-container rounded-lg animate-pulse" />
                ))
              ) : doneTasks.length > 0 ? (
                doneTasks.map((task) => (
                  <div key={task._id} className="group flex items-center gap-4 p-4 rounded-lg bg-surface-container transition-all">
                    <button 
                      onClick={() => toggleTask(task)}
                      className="w-6 h-6 border-2 border-secondary bg-secondary rounded flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-on-secondary text-sm font-bold">check</span>
                    </button>
                    <span className="flex-grow font-medium text-on-surface/50 line-through decoration-on-surface/30">{task.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-4">No completed tasks yet</p>
              )}
            </div>
          </Panel>

          <Panel>
            <h4 className="text-xs text-on-surface-variant mb-4">Task summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xl font-mono font-medium text-on-surface">{todoTasks.length}</span>
                <span className="text-xs text-on-surface-variant">To do</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-mono font-medium text-primary">{inProgressTasks.length}</span>
                <span className="text-xs text-on-surface-variant">Active</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-mono font-medium text-secondary">{doneTasks.length}</span>
                <span className="text-xs text-on-surface-variant">Done</span>
              </div>
            </div>
          </Panel>
        </section>

        {highPriorityTasks.length > 0 && (
          <Panel className="col-span-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[20px]">bolt</span>
                <h3 className="text-sm font-medium text-on-surface">High priority</h3>
              </div>
              <span className="text-xs text-on-surface-variant">{highPriorityTasks.length} urgent</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highPriorityTasks.map((task) => (
                <div key={task._id} className="p-4 rounded-md border border-[var(--border)] bg-surface-container-low hover:bg-surface-container transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-error-container text-error">
                      High
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleTask(task)}
                      className="w-5 h-5 flex-shrink-0 mt-1 border-2 border-outline rounded flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                    />
                    <p className="font-medium text-on-surface group-hover:text-primary transition-colors">{task.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      <button 
        type="button"
        onClick={() => {
          const input = document.querySelector<HTMLInputElement>('input[placeholder="Task Title"]');
          input?.focus();
        }}
        className="fixed bottom-8 right-8 w-11 h-11 rounded-md bg-primary text-on-primary border border-[var(--border)] flex items-center justify-center hover:opacity-90 transition-opacity z-50"
        aria-label="Add task"
      >
        <span className="material-symbols-outlined text-[22px]">add_task</span>
      </button>
    </main>
  );
}
