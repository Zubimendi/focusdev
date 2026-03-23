"use client";

import React from "react";

const dailyRitual = [
  { id: 1, text: "Review Pull Requests", completed: true, priority: "High", color: "text-error", bg: "bg-error-container" },
  { id: 2, text: "Clear Jira Inbox", completed: false, priority: "Medium", color: "text-on-tertiary-container", bg: "bg-tertiary-container" },
  { id: 3, text: "Update Documentation", completed: false, priority: "Low", color: "text-outline", bg: "bg-surface-container-highest" },
];

const leetCodeGoals = [
  { id: 1, text: "Invert Binary Tree", completed: true, meta: "EASY • RECURSION" },
  { id: 2, text: "Two Sum II", completed: false, meta: "MEDIUM • TWO POINTERS" },
];

const sprintTasks = [
  { id: 1, text: "Refactor authentication middleware for JWT refresh", priority: "High", priorityColor: "bg-error-container text-error" },
  { id: 2, text: "Optimize PostgreSQL queries for dashboard metrics", priority: "Medium", priorityColor: "bg-tertiary-container text-on-tertiary-container" },
  { id: 3, text: "Update favicon assets for dark/light modes", priority: "Low", priorityColor: "bg-surface-container-highest text-outline" },
];

export default function ChecklistsPage() {
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
            <p className="text-4xl font-mono text-secondary font-bold">68%</p>
          </div>
        </div>
        
        {/* Global Progress Bar */}
        <div className="h-4 w-full bg-surface-container-lowest rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-secondary/5 blur-md"></div>
          <div 
            className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full relative shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all duration-1000" 
            style={{ width: "68%" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout for Checklist Sections */}
      <div className="grid grid-cols-12 gap-8">
        {/* Daily Ritual Section */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">wb_sunny</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Daily Ritual</h3>
            </div>
            <button className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {dailyRitual.map((task) => (
              <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all border-l-4 translate-x-0 hover:translate-x-2 ${task.completed ? "border-secondary" : "border-transparent"}`}>
                <span className="material-symbols-outlined text-outline-variant cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                <div className="relative w-6 h-6 flex-shrink-0">
                  <input defaultChecked={task.completed} className="peer opacity-0 absolute inset-0 z-10 cursor-pointer" type="checkbox"/>
                  <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${task.completed ? "border-secondary bg-secondary" : "border-outline peer-checked:bg-secondary peer-checked:border-secondary"}`}>
                    <span className={`material-symbols-outlined text-on-secondary text-sm font-bold ${task.completed ? "" : "opacity-0 peer-checked:opacity-100"}`}>check</span>
                  </div>
                </div>
                <span className={`flex-grow font-medium transition-all ${task.completed ? "text-on-surface/50 line-through decoration-on-surface/30" : "text-on-surface"}`}>
                  {task.text}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.bg} ${task.color}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            
            <button className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-outline-variant/30 text-outline hover:border-primary/50 hover:text-primary transition-all">
              <span className="material-symbols-outlined">add</span>
              <span className="font-medium">Add task to Ritual</span>
            </button>
          </div>
        </section>

        {/* LeetCode Goals Section */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          <div className="bg-surface-container-low p-8 rounded-xl shadow-xl border-t-4 border-tertiary">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-tertiary/10 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary">code</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">LeetCode Goals</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              {leetCodeGoals.map((goal) => (
                <div key={goal.id} className="group flex items-center gap-4 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all">
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <input defaultChecked={goal.completed} className="peer opacity-0 absolute inset-0 z-10 cursor-pointer" type="checkbox"/>
                    <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${goal.completed ? "border-tertiary bg-tertiary" : "border-outline peer-checked:bg-tertiary peer-checked:border-tertiary"}`}>
                      <span className={`material-symbols-outlined text-on-tertiary text-sm font-bold ${goal.completed ? "" : "opacity-0 peer-checked:opacity-100"}`}>check</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-medium transition-all ${goal.completed ? "text-on-surface/50 line-through" : "text-on-surface"}`}>
                      {goal.text}
                    </span>
                    <span className="text-[10px] font-mono text-outline">{goal.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Visual */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-xl border border-primary/20 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Focus Efficiency</h4>
            <div className="flex items-baseline gap-2 mb-6 text-on-surface">
              <span className="text-5xl font-mono font-bold">12.4</span>
              <span className="text-outline text-lg font-mono">hrs</span>
            </div>
            <div className="grid grid-cols-7 gap-1 h-12">
              <div className="bg-primary/20 rounded-sm h-[40%] mt-auto transition-all duration-500"></div>
              <div className="bg-primary/20 rounded-sm h-[60%] mt-auto transition-all duration-500 delay-75"></div>
              <div className="bg-primary/40 rounded-sm h-[80%] mt-auto transition-all duration-500 delay-150"></div>
              <div className="bg-primary/60 rounded-sm h-[30%] mt-auto transition-all duration-500 delay-225"></div>
              <div className="bg-primary/80 rounded-sm h-[90%] mt-auto transition-all duration-500 delay-300"></div>
              <div className="bg-primary rounded-sm h-[100%] mt-auto transition-all duration-500 delay-375"></div>
              <div className="bg-surface-container-highest rounded-sm h-[20%] mt-auto transition-all duration-500 delay-450"></div>
            </div>
          </div>
        </section>

        {/* Sprint Tasks Section */}
        <section className="col-span-12 bg-surface-container-low p-8 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">bolt</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Sprint Tasks</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-outline font-mono">
              <span className="px-3 py-1 bg-surface-container-highest rounded-full">v2.4.0-release</span>
              <span>DUE IN 3 DAYS</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sprintTasks.map((task) => (
              <div key={task.id} className="bg-surface-container p-5 rounded-lg border border-transparent hover:border-primary/20 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.priorityColor}`}>
                    {task.priority}
                  </span>
                  <span className="material-symbols-outlined text-outline-variant text-sm cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">drag_handle</span>
                </div>
                <div className="flex gap-4">
                  <div className="relative w-5 h-5 flex-shrink-0 mt-1">
                    <input className="peer opacity-0 absolute inset-0 z-10 cursor-pointer" type="checkbox"/>
                    <div className="w-5 h-5 border-2 border-outline rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-colors">
                      <span className="material-symbols-outlined text-on-primary text-[10px] font-bold opacity-0 peer-checked:opacity-100">check</span>
                    </div>
                  </div>
                  <p className="font-medium text-on-surface group-hover:text-primary transition-colors">{task.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary-container text-on-primary-container shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
        <span className="material-symbols-outlined text-3xl">add_task</span>
      </button>
    </main>
  );
}
