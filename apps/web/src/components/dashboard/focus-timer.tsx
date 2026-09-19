"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings";
import { useTimerStore } from "@/store/timer-store";
import { Button } from "@/components/ui/button";

export default function FocusTimer() {
  const timerDuration = useSettingsStore((s) => s.timerDuration);
  const {
    remainingSeconds,
    durationSeconds,
    isActive,
    sessionId,
    setDurationMinutes,
    start,
    stop,
    reset,
    tick,
    syncFromClock,
  } = useTimerStore();
  const completingRef = useRef(false);

  useEffect(() => {
    setDurationMinutes(timerDuration);
  }, [timerDuration, setDurationMinutes]);

  useEffect(() => {
    syncFromClock();
  }, [syncFromClock]);

  useEffect(() => {
    if (!isActive) return;
    const id = window.setInterval(() => tick(), 250);
    return () => window.clearInterval(id);
  }, [isActive, tick]);

  useEffect(() => {
    if (isActive || remainingSeconds > 0 || !sessionId || completingRef.current)
      return;
    completingRef.current = true;
    (async () => {
      try {
        await fetch(`/api/focus/end/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Pomodoro complete" }),
        });
        toast.success("Focus block complete");
      } catch {
        /* ignore */
      } finally {
        stop();
        completingRef.current = false;
      }
    })();
  }, [isActive, remainingSeconds, sessionId, stop]);

  const toggleTimer = async () => {
    if (!isActive) {
      if (remainingSeconds === 0) {
        reset();
        return;
      }
      try {
        const res = await fetch("/api/focus/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startTime: new Date().toISOString() }),
        });
        const data = await res.json();
        if (res.ok) {
          start(data.session._id || data.session.id);
          toast.success("Focus session started");
        } else {
          start(null);
          toast.error("Couldn't sync — running locally");
        }
      } catch {
        start(null);
        toast.error("Couldn't sync — running locally");
      }
    } else {
      try {
        if (sessionId) {
          await fetch(`/api/focus/end/${sessionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: "Focused session" }),
          });
        }
        stop();
        toast.success("Session ended");
      } catch {
        stop();
        toast.error("Couldn't sync session end");
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    durationSeconds > 0
      ? ((durationSeconds - remainingSeconds) / durationSeconds) * 1000
      : 0;

  return (
    <section className="relative flex flex-col items-center justify-center py-10 px-6 bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)]">
      <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            className="text-surface-container-high"
            cx="50%"
            cy="50%"
            fill="transparent"
            r="46%"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            className="text-primary"
            cx="50%"
            cy="50%"
            fill="transparent"
            r="46%"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="1000"
            strokeDashoffset={1000 - progress}
            style={{ transition: "stroke-dashoffset 0.25s linear" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-1 z-10">
          <span className="text-5xl md:text-6xl font-mono font-medium tracking-tighter text-on-surface">
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-xs text-on-surface-variant">
            {isActive ? "Focusing" : "Ready"}
          </span>
        </div>
      </div>

      <div className="mt-8 flex gap-2 w-full max-w-sm">
        <Button onClick={toggleTimer} className="flex-1" size="lg">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isActive ? "stop" : "play_arrow"}
          </span>
          {isActive ? "Stop" : "Start focus"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          size="lg"
          type="button"
          onClick={() => reset()}
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Reset
        </Button>
      </div>
    </section>
  );
}
