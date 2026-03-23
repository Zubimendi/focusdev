"use client"
import React, { useState } from "react";
import { toast } from "sonner";

const initialChecklist = [
  { id: 1, text: "LeetCode done today", completed: true },
  { id: 2, text: "Flashcards reviewed", completed: false },
  { id: 3, text: "Deployed something", completed: false },
  { id: 4, text: "Tweeted progress", completed: true, strike: true },
];

export default function DailyChecklist() {
  const [items, setItems] = useState(initialChecklist);

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newState = !item.completed;
        if (newState) toast.success(`Task completed: ${item.text}`);
        return { ...item, completed: newState };
      }
      return item;
    }));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <aside className="w-full md:w-80 flex flex-col gap-6 order-3">
      <section className="bg-surface-container-low rounded-xl p-6 shadow-none flex flex-col gap-6 overflow-hidden relative">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-on-surface-variant uppercase">Daily Checklist</h2>
          <span className="material-symbols-outlined text-secondary">task_alt</span>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <label 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className={`flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer group ${item.completed && item.strike ? 'bg-surface-container-high/50' : ''}`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                item.completed ? 'border-primary/40 bg-primary/20' : 'border-outline-variant/30 group-hover:border-outline-variant'
              }`}>
                {item.completed && (
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 700" }}>check</span>
                )}
              </div>
              <span className={`text-sm font-medium transition-all ${
                item.completed && item.strike ? 'text-on-surface line-through opacity-50' : item.completed ? 'text-on-surface' : 'text-on-surface-variant'
              }`}>
                {item.text}
              </span>
            </label>
          ))}
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
            {progressPercent === 100 ? "Ascended state reached! 🚀" : "Flow state detected in last 2 sessions"}
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
