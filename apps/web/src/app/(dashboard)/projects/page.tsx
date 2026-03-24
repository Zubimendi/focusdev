import React from "react";

export default function ProjectsPage() {
  const projects = [
    { name: "FocusDev Monorepo", repo: "Zubimendi/focusdev", focusTime: "24h 45m", status: "active", color: "bg-indigo-500" },
    { name: "E-commerce Frontend", repo: "Zubimendi/shop-ui", focusTime: "12h 10m", status: "paused", color: "bg-emerald-500" },
    { name: "Personal Portfolio", repo: "Zubimendi/portfolio", focusTime: "5h 50m", status: "active", color: "bg-amber-500" },
    { name: "Quantum Physics Lib", repo: "Zubimendi/q-phys", focusTime: "30m", status: "active", color: "bg-rose-500" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-8 py-12 flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded w-fit">Developer Workspace</label>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">Project Focus</h1>
          <p className="text-on-surface-variant max-w-lg">Track your deep work hours per repository and analyze where your engineering energy is going.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group">
          <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add</span>
          Connect Repository
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.repo} className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hover:bg-surface-container-high transition-all group flex flex-col gap-6 cursor-default">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.color} shadow-lg shadow-black/20`}>
                <span className="material-symbols-outlined text-white">folder</span>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${project.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {project.status}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-on-surface">{project.name}</h3>
              <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5 opacity-60">
                <span className="material-symbols-outlined text-sm">link</span>
                {project.repo}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Focus</span>
                <span className="text-xl font-mono font-bold text-on-surface">{project.focusTime}</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-indigo-500 hover:text-white transition-all">
                <span className="material-symbols-outlined">analytics</span>
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder for Add New */}
        <button className="bg-surface-container-low/40 rounded-2xl p-6 border-2 border-dashed border-white/5 hover:border-indigo-500/20 hover:bg-surface-container-low transition-all flex flex-col items-center justify-center gap-4 text-on-surface-variant group h-full min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors">account_tree</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Manage Monorepos</span>
        </button>
      </section>

      {/* Analytics Insight */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/10 p-8 rounded-3xl border border-indigo-500/10 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <span className="material-symbols-outlined text-4xl text-indigo-400">insights</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Engineering Analysis</h2>
          <p className="text-slate-400 max-w-xl">You&apos;ve spent <span className="text-indigo-400 font-bold">82%</span> of your focus time this week on the <span className="text-on-surface font-semibold underline decoration-indigo-500/50 underline-offset-4">focusdev</span> project. Consider checking your backlog on secondary projects.</p>
        </div>
        <button className="px-6 py-2 bg-on-secondary-container-fixed text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary/5 transition-all text-sm uppercase tracking-wider">
          View Detail
        </button>
      </section>
    </main>
  );
}
