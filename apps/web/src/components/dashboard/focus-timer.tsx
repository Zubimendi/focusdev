"use client";

import { useState, useEffect } from "react";

export default function FocusTimer() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = async () => {
    if (!isActive) {
      // Start session
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
        }
      } catch (error) {
        console.error("Failed to start session", error);
      }
    } else {
      // End session
      try {
        const res = await fetch(`/api/focus/end/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Focused session" }),
        });
        if (res.ok) {
          setIsActive(false);
          setSeconds(0);
          setSessionId(null);
        }
      } catch (error) {
        console.error("Failed to end session", error);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <h2 className="text-xl font-bold mb-4">Focus Timer</h2>
      <div className="text-5xl font-mono mb-6">{formatTime(seconds)}</div>
      <button
        onClick={toggleTimer}
        className={`px-8 py-3 rounded-full font-bold text-white transition ${
          isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isActive ? "End Session" : "Start Focus"}
      </button>
    </div>
  );
}
