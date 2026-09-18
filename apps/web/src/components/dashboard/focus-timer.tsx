"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings";
import { Button } from "@/components/ui/button";

export default function FocusTimer() {
  const { timerDuration } = useSettingsStore();
  const initialSeconds = useMemo(() => timerDuration * 60, [timerDuration]);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSeconds(initialSeconds);
    }
  }, [initialSeconds, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = async () => {
    if (!isActive) {
      if (seconds === 0) {
        setSeconds(initialSeconds);
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
          setSessionId(data.session._id);
          setIsActive(true);
          toast.success("Focus session started");
        }
      } catch (error) {
        console.error("Failed to start session", error);
        toast.error("Couldn't sync — starting locally");
        setIsActive(true);
      }
    } else {
      try {
        const res = await fetch(`/api/focus/end/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Focused session" }),
        });
        if (res.ok) {
          setIsActive(false);
          setSeconds(initialSeconds);
          setSessionId(null);
          toast.success("Session ended");
        }
      } catch (error) {
        console.error("Failed to end session", error);
        toast.error("Couldn't sync session end");
        setIsActive(false);
        setSeconds(initialSeconds);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((initialSeconds - seconds) / initialSeconds) * 1000;

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
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-1 z-10">
          <span className="text-5xl md:text-6xl font-mono font-medium tracking-tighter text-on-surface">
            {formatTime(seconds)}
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
            {isActive ? "pause" : "play_arrow"}
          </span>
          {isActive ? "Pause" : "Start focus"}
        </Button>
        <Button variant="secondary" className="flex-1" size="lg" type="button">
          <span className="material-symbols-outlined text-[18px]">coffee</span>
          Break
        </Button>
      </div>
    </section>
  );
}
