"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FocusTimer() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // Default 25:00
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
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
        setSeconds(1500);
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
          toast.success("Focus session started! Deep work begins now.");
        }
      } catch (error) {
        console.error("Failed to start session", error);
        toast.error("Cloud sync failed, but starting local timer.");
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
          setSeconds(1500);
          setSessionId(null);
          toast.success("Focus session ended. Great work!");
        }
      } catch (error) {
        console.error("Failed to end session", error);
        toast.error("Couldn't sync session end, local timer reset.");
        setIsActive(false);
        setSeconds(1500);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((1500 - seconds) / 1500) * 1000;

  return (
    <section className="relative flex flex-col items-center justify-center py-12 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        {/* Progress Ring SVG */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            className="text-surface-container-high" 
            cx="50%" cy="50%" fill="transparent" r="48%" 
            stroke="currentColor" strokeWidth="2"
          ></circle>
          <circle 
            className="text-primary drop-shadow-[0_0_8px_rgba(192,193,255,0.4)]" 
            cx="50%" cy="50%" fill="transparent" r="48%" 
            stroke="currentColor" strokeWidth="4"
            strokeDasharray="1000"
            strokeDashoffset={1000 - progress}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          ></circle>
        </svg>
        
        <div className="flex flex-col items-center gap-2 z-10 transition-all">
          <span className="text-7xl md:text-8xl font-mono font-bold tracking-tighter text-on-surface">
            {formatTime(seconds)}
          </span>
          <span className="text-sm font-medium text-on-surface-variant tracking-widest uppercase">
            {isActive ? "Focusing" : "Pomodoro"}
          </span>
        </div>
      </div>

      <div className="mt-12 flex gap-4 w-full max-w-sm px-6">
        <button 
          onClick={toggleTimer}
          className="flex-1 py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isActive ? "pause" : "play_arrow"}
          </span>
          {isActive ? "Pause" : "Start Focus"}
        </button>
        <button className="flex-1 py-4 rounded-lg border border-outline-variant/30 text-on-surface font-bold text-lg hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">coffee</span>
          Take Break
        </button>
      </div>
    </section>
  );
}
