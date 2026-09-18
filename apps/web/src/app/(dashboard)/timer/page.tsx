"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

export default function TimerPage() {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          // Show in_progress and todo tasks
          const activeTasks = (data.tasks || []).filter(
            (t: Task) => t.status !== "done"
          );
          setTasks(activeTasks.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (sessionId) endSession();
      toast.success("Pomodoro complete! Time for a break.");
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, seconds]);

  const startSession = async () => {
    try {
      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: new Date().toISOString() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session._id);
        setIsActive(true);
        toast.success("Focus session started!");
      }
    } catch {
      toast.error("Failed to sync session, starting local timer.");
      setIsActive(true);
    }
  };

  const endSession = async () => {
    try {
      if (sessionId) {
        await fetch(`/api/focus/end/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Pomodoro session completed" }),
        });
      }
    } catch {
      console.error("Failed to end session");
    }
    setIsActive(false);
    setSeconds(1500);
    setSessionId(null);
  };

  const toggleTimer = async () => {
    if (!isActive) {
      if (seconds === 0) {
        setSeconds(1500);
        return;
      }
      await startSession();
    } else {
      await endSession();
      toast.success("Session ended. Great work!");
    }
  };

  const completeTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== task._id));
        toast.success(`Completed: ${task.title}`);
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((1500 - seconds) / 1500) * 880;
  const currentTask = tasks[0];
  const remainingTasks = tasks.slice(1);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 lg:px-10 w-full flex flex-col gap-8">
      <PageHeader
        title="Timer"
        description="25-minute Pomodoro with synced focus sessions."
        actions={
          <div className="flex items-center gap-2 text-sm text-on-surface-variant border border-[var(--border)] rounded-md px-3 py-1.5 bg-surface-container-lowest">
            <span
              className={`w-2 h-2 rounded-full ${isActive ? "bg-secondary" : "bg-outline-variant"}`}
            />
            {isActive ? "Session active" : "Ready"}
          </div>
        }
      />

      <section className="flex flex-col items-center">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 384">
            <circle
              className="text-surface-container-high"
              cx="192"
              cy="192"
              r="140"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              className="text-primary"
              cx="192"
              cy="192"
              r="140"
              fill="transparent"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="4"
              strokeDasharray="880"
              strokeDashoffset={880 - progress}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "192px 192px",
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>
          <div className="z-10 flex flex-col items-center">
            <span className="text-5xl sm:text-6xl font-mono font-medium tracking-tight text-on-surface">
              {formatTime(seconds)}
            </span>
            <span className="text-xs text-on-surface-variant mt-2">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              · Pomodoro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setSeconds(1500);
              setIsActive(false);
              setSessionId(null);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant={isActive ? "danger" : "primary"}
            size="lg"
            className="!h-11 !px-6"
            onClick={toggleTimer}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isActive ? "stop" : "play_arrow"}
            </span>
            {isActive ? "Stop" : "Start"}
          </Button>
          <Button type="button" variant="ghost" size="sm">
            Break
          </Button>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base text-on-surface">Next up</h2>
            <span className="text-xs text-on-surface-variant">
              {tasks.length} remaining
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-7 h-20 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)] animate-pulse" />
              <div className="col-span-12 md:col-span-5 h-20 bg-surface-container-low rounded-[var(--radius-md)] border border-[var(--border)] animate-pulse" />
            </div>
          ) : currentTask ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Panel className="col-span-12 md:col-span-7 !p-4 flex items-center gap-4 group">
                <div className="w-9 h-9 rounded-md bg-primary/10 border border-[var(--border)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    terminal
                  </span>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-on-surface-variant mb-0.5">
                    Current focus
                  </p>
                  <h3 className="text-sm font-medium text-on-surface truncate">
                    {currentTask.title}
                  </h3>
                  {currentTask.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {currentTask.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => completeTask(currentTask)}
                  className="w-9 h-9 rounded-md border border-[var(--border)] flex items-center justify-center hover:bg-primary hover:border-primary hover:text-on-primary transition-colors shrink-0"
                  aria-label="Complete task"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                </button>
              </Panel>
              {remainingTasks[0] && (
                <Panel className="col-span-12 md:col-span-5 !p-4 flex items-center justify-between">
                  <div className="text-left min-w-0">
                    <h4 className="text-sm font-medium text-on-surface truncate">
                      {remainingTasks[0].title}
                    </h4>
                    {remainingTasks[0].description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1">
                        {remainingTasks[0].description}
                      </p>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          ) : (
            <Panel className="text-center py-8">
              <p className="text-sm text-on-surface-variant">
                All tasks completed. Create more from the dashboard.
              </p>
            </Panel>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Panel className="!p-4 text-center">
              <span className="text-xl font-mono font-medium text-on-surface">
                12
              </span>
              <p className="text-xs text-on-surface-variant mt-1">Day streak</p>
            </Panel>
            <Panel className="!p-4 text-center">
              <span className="text-xl font-mono font-medium text-on-surface">
                {String(tasks.length).padStart(2, "0")}
              </span>
              <p className="text-xs text-on-surface-variant mt-1">Tasks left</p>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}
