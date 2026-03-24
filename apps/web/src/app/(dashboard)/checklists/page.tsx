"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function ChecklistsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [data.task, ...prev]);
        setNewTaskTitle("");
        toast.success(`Task "${newTaskTitle}" added!`);
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
    <main className="max-w-[1400px] mx-auto p-12">
      {/* Header Section with Progress */}
      <header className="mb-12 flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-secondary font-mono text-sm tracking-widest uppercase mb-2 block">Developer Execution</span>
            <h2 className="text-5xl font-extrabold tracking-tighter text-on-surface">Checklists</h2>
          </div>
          <div className="text-right">
            <p className="text-outline text-sm font-mono mb-1">DAILY COMPLETION</p>
            {loading ? (
              <div className="h-12 w-16 bg-surface-container-high rounded animate-pulse" />
            ) : (
              <p className="text-4xl font-mono text-secondary font-bold">{progressPercent}%</p>
            )}
          </div>
        </div>
        
        {/* Global Progress Bar */}
        <div className="h-4 w-full bg-surface-container-lowest rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-secondary/5 blur-md"></div>
          <div 
            className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full relative shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all duration-1000" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout for Checklist Sections */}
      <div className="grid grid-cols-12 gap-8">
        {/* Active Tasks Section */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">wb_sunny</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Active Tasks</h3>
              <span className="text-xs font-mono text-outline bg-surface-container-high px-2 py-1 rounded-full">{todoTasks.length + inProgressTasks.length} remaining</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-surface-container rounded-lg animate-pulse" />
              ))
            ) : (
              [...inProgressTasks, ...todoTasks].map((task) => {
                const style = getPriorityStyle(task.priority);
                return (
                  <div key={task._id} className={`group flex items-center gap-4 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all border-l-4 translate-x-0 hover:translate-x-2 border-transparent`}>
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <button 
                        onClick={() => toggleTask(task)}
                        className="w-6 h-6 border-2 border-outline rounded flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors"
                      >
                      </button>
                    </div>
                    <span className="flex-grow font-medium text-on-surface">{task.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.bg} ${style.color}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error/80"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                );
              })
            )}
            
            {/* Add Task Input */}
            <div className="flex gap-3 mt-4">
              <input
                className="flex-1 px-4 py-3 rounded-lg bg-surface-container border-2 border-dashed border-outline-variant/30 text-on-surface placeholder:text-outline focus:border-primary/50 focus:outline-none transition-all"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createTask()}
              />
              <button 
                onClick={createTask}
                className="px-4 py-3 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Completed + Stats Section */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          {/* Completed Tasks */}
          <div className="bg-surface-container-low p-8 rounded-xl shadow-xl border-t-4 border-secondary">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">Completed</h3>
              </div>
              <span className="text-xs font-mono text-secondary">{doneTasks.length} done</span>
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
          </div>

          {/* Stats Visual */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-xl border border-primary/20 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Task Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-bold text-on-surface">{todoTasks.length}</span>
                <span className="text-[10px] text-outline uppercase tracking-widest">To Do</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-bold text-primary">{inProgressTasks.length}</span>
                <span className="text-[10px] text-outline uppercase tracking-widest">Active</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-bold text-secondary">{doneTasks.length}</span>
                <span className="text-[10px] text-outline uppercase tracking-widest">Done</span>
              </div>
            </div>
          </div>
        </section>

        {/* High Priority Section */}
        {highPriorityTasks.length > 0 && (
          <section className="col-span-12 bg-surface-container-low p-8 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-error/10 rounded-lg">
                  <span className="material-symbols-outlined text-error">bolt</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">Priority Queue</h3>
              </div>
              <span className="text-xs font-mono text-error">{highPriorityTasks.length} urgent</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highPriorityTasks.map((task) => (
                <div key={task._id} className="bg-surface-container p-5 rounded-lg border border-transparent hover:border-error/20 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-error-container text-error">
                      High Priority
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
          </section>
        )}
      </div>

      {/* Contextual FAB */}
      <button 
        onClick={() => {
          const input = document.querySelector<HTMLInputElement>('input[placeholder="Add a new task..."]');
          input?.focus();
        }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary-container text-on-primary-container shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-3xl">add_task</span>
      </button>
    </main>
  );
}
