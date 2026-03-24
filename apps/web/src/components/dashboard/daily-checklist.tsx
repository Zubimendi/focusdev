"use client"
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
}

export default function DailyChecklist() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks?.slice(0, 5) || []);
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
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const completedCount = tasks.filter(t => t.status === "done").length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <aside className="w-full md:w-80 flex flex-col gap-6 order-3">
      <section className="bg-surface-container-low rounded-xl p-6 shadow-none flex flex-col gap-6 overflow-hidden relative">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-on-surface-variant uppercase">Daily Checklist</h2>
          <span className="material-symbols-outlined text-secondary">task_alt</span>
        </div>

        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <label 
                key={task._id} 
                onClick={() => toggleTask(task)}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer group ${task.status === "done" ? 'bg-surface-container-high/50' : ''}`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  task.status === "done" ? 'border-primary/40 bg-primary/20' : 'border-outline-variant/30 group-hover:border-outline-variant'
                }`}>
                  {task.status === "done" && (
                    <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 700" }}>check</span>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-sm font-medium transition-all ${
                    task.status === "done" ? 'text-on-surface line-through opacity-50' : 'text-on-surface'
                  }`}>
                    {task.title}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    task.priority === 'high' ? 'text-error' : task.priority === 'medium' ? 'text-tertiary' : 'text-outline'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-4">No tasks yet. Create one to get started!</p>
          )}
        </div>

        <div className="mt-4 pt-6 border-t border-outline-variant/10">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Focus Quality ({Math.round(progressPercent)}%)</p>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[10px] text-on-surface-variant text-right italic">
            {progressPercent === 100 ? "Ascended state reached! 🚀" : `${completedCount}/${tasks.length} tasks completed`}
          </p>
        </div>
      </section>

      {/* Quick Tip Card */}
      <section className="bg-gradient-to-br from-surface-container-low to-surface-container-high p-6 rounded-xl border border-primary/10">
        <div className="flex gap-3 items-start">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-on-surface uppercase tracking-widest">Developer Pro-Tip</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">Turn off Slack notifications during your next Pomodoro to reach 2x depth.</p>
          </div>
        </div>
      </section>
    </aside>
  );
}
