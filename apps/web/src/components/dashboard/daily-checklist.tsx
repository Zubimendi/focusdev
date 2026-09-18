"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/ui/panel";

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
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id ? { ...t, status: newStatus } : t
          )
        );
        if (newStatus === "done") toast.success(`Done: ${task.title}`);
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progressPercent =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <aside className="w-full md:w-72 flex flex-col gap-4 order-3">
      <Panel className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-on-surface">Today</h2>
          <span className="text-xs text-on-surface-variant font-mono">
            {completedCount}/{tasks.length}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 bg-surface-container rounded animate-pulse"
                />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <button
                key={task._id}
                type="button"
                onClick={() => toggleTask(task)}
                className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-container transition-colors text-left w-full ${
                  task.status === "done" ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    task.status === "done"
                      ? "border-primary bg-primary/15"
                      : "border-outline-variant"
                  }`}
                >
                  {task.status === "done" && (
                    <span
                      className="material-symbols-outlined text-[12px] text-primary"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
                      check
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm flex-1 truncate ${
                    task.status === "done"
                      ? "line-through text-on-surface-variant"
                      : "text-on-surface"
                  }`}
                >
                  {task.title}
                </span>
              </button>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant py-2">
              No tasks yet.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[var(--border)]">
          <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Panel>
    </aside>
  );
}
