"use client";

import React, { useEffect, useState } from "react";

export default function SessionList() {
  const [sessions, setSessions] = useState<{ _id: string; notes?: string; startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/focus");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (_error) {
        console.error("Failed to fetch sessions", _error);
      }
    };
    fetchSessions();
  }, []);

  return (
    <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0 order-2 md:order-1">
      <section className="bg-surface-container-low rounded-xl p-6 shadow-none flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-on-surface-variant uppercase">Today&apos;s Sessions</h2>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
            {sessions.length}/8
          </span>
        </div>
        
        <div className="flex flex-col gap-6">
          {sessions.length > 0 ? (
            sessions.slice(0, 3).map((session) => (
              <div key={session._id} className="flex gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-secondary transition-colors group-hover:bg-surface-container-highest">
                  <span className="material-symbols-outlined">code</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{session.notes || "Focused work"}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-secondary-fixed-variant bg-secondary/20 px-1.5 py-0.5 rounded">
                      Coding
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} min
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant italic">No sessions today.</p>
          )}
        </div>

        <button className="w-full py-3 rounded-lg border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">history</span>
          View Full History
        </button>
      </section>
    </aside>
  );
}
