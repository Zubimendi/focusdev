import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 dot-grid opacity-20 dark:opacity-30"></div>
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-20 flex flex-col items-center text-center">
        {/* Logo Badge */}
        <div className="mb-12 flex items-center gap-3 glass-panel px-6 py-3 rounded-2xl shadow-xl dark:shadow-2xl">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="text-2xl font-black text-on-surface tracking-tighter">FocusDev</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-on-surface mb-8 leading-none">
          Monolithic <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Clarity.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mb-12 font-medium leading-relaxed">
          The ultimate productivity engine for developers. <br className="hidden md:block" />
          Master your sessions, automate your rituals, and achieve deep work.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link 
            href="/register"
            className="px-10 py-5 bg-primary text-on-primary font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Get Started Free
          </Link>
          <Link 
            href="/login"
            className="px-10 py-5 glass-panel text-on-surface font-bold text-lg rounded-2xl hover:bg-surface-container-high transition-all w-full sm:w-auto shadow-sm"
          >
            Member Login
          </Link>
        </div>

        {/* Feature Strips */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-8 glass-panel rounded-3xl shadow-md transition-transform hover:translate-y-[-4px]">
            <span className="material-symbols-outlined text-primary mb-4 text-3xl">timer</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Deep Focus</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Advanced Pomodoro engine with custom work cycle analytics.</p>
          </div>
          <div className="p-8 glass-panel rounded-3xl shadow-md transition-transform hover:translate-y-[-4px]">
            <span className="material-symbols-outlined text-secondary mb-4 text-3xl">fact_check</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Daily Rituals</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Automated developer checklists to keep your sprint on track.</p>
          </div>
          <div className="p-8 glass-panel rounded-3xl shadow-md transition-transform hover:translate-y-[-4px]">
            <span className="material-symbols-outlined text-tertiary mb-4 text-3xl">insights</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Goal Tracking</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Visualize your LeetCode goals and technical growth milestones.</p>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="absolute bottom-8 text-outline text-[10px] uppercase font-mono tracking-[0.4em] pointer-events-none opacity-50">
        Developed for Monolithic Precision
      </footer>
    </div>
  );
}
