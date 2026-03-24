import FocusTimer from "@/components/dashboard/focus-timer";
import DailyChecklist from "@/components/dashboard/daily-checklist";

export default async function DashboardPage() {

  return (
    <main className="max-w-[1920px] mx-auto px-8 py-12 flex flex-col lg:flex-row gap-8">
      {/* Main Center Content: Timer & Active Session */}
      <div className="flex-1 flex flex-col gap-8 order-1 md:order-2">
        {/* Hero Timer Section */}
        <FocusTimer />

        {/* Task Input Section */}
        <section className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">target</span>
              Active Mission
            </label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-lg py-4 px-6 text-xl placeholder:text-on-surface-variant/40 font-medium transition-all outline-none text-on-surface" 
                placeholder="What are you working on?" 
                type="text"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold uppercase tracking-wider hover:bg-secondary/20 transition-colors">Coding</button>
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/10 text-xs font-bold uppercase tracking-wider hover:text-on-surface transition-colors">Learning</button>
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/10 text-xs font-bold uppercase tracking-wider hover:text-on-surface transition-colors">Building</button>
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/10 text-xs font-bold uppercase tracking-wider hover:text-on-surface transition-colors">Review</button>
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/10 text-xs font-bold uppercase tracking-wider hover:text-on-surface transition-colors">Other</button>
          </div>
        </section>

        {/* Bottom Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sessions Today</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-on-surface">4</span>
              <span className="text-xs text-secondary font-medium">+1 from avg</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Focus Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-on-surface">1h 40m</span>
              <span className="text-xs text-on-surface-variant">Top 5% today</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-1 group hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Current Streak</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-primary">12 days</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Sidebar: Checklist */}
      <DailyChecklist />
    </main>
  );
}
