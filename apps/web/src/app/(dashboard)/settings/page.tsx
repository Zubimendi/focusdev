"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings";
import { signIn } from "next-auth/react";

export default function SettingsPage() {
  const { theme, setTheme, timerDuration, setTimerDuration, notificationSound, setNotificationSound } = useSettingsStore();
  const [localTimer, setLocalTimer] = useState(timerDuration);
  const [activeTab, setActiveTab] = useState("App Preferences");
  
  useEffect(() => {
    setLocalTimer(timerDuration);
  }, [timerDuration]);

  const saveSettings = () => {
    setTimerDuration(localTimer);
    toast.success("All settings saved successfully! Workspace optimized.");
  };

  return (
    <main className="flex-1 p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant text-lg font-medium opacity-80">Configure your workspace for maximum cognitive output.</p>
      </div>

      {/* Tabs Interface */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl mb-12 w-fit border border-outline-variant/10">
        {["Profile", "App Preferences", "Integrations", "Billing"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === tab ? 'text-primary bg-surface-container-high shadow-lg' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Dynamic Content Based on Tabs */}
        {activeTab === "Profile" && (
          <section className="md:col-span-12 bg-surface-container-low rounded-2xl p-8 relative overflow-hidden border border-outline-variant/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10"></div>
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person</span>
              Profile Identity
            </h2>
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-outline-variant/20 bg-surface-container-highest flex items-center justify-center">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">A</div>
                </div>
                <button className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-lg shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>
              <div className="flex-1 w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Full Name</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                    type="text" 
                    defaultValue="Alex Chen"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Email Address</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                    type="email" 
                    defaultValue="alex.chen@focusdev.io"
                  />
                </div>
                <button className="bg-surface-container-highest hover:bg-surface-bright text-primary font-bold px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-black/20">
                  Update Profile
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "App Preferences" && (
          <section className="md:col-span-12 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">tune</span>
              App Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-on-surface">
              {/* Theme Toggle */}
              <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 border border-outline-variant/5 shadow-inner">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 block">Appearance</label>
                <div className="flex bg-surface-container p-1.5 rounded-xl">
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg font-bold transition-all ${theme === 'dark' ? 'bg-surface-container-highest text-on-surface shadow-md' : 'text-on-surface-variant hover:text-on-surface opacity-50'}`}
                  >
                    <span className="material-symbols-outlined text-lg">dark_mode</span>
                    <span>Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg font-bold transition-all ${theme === 'light' ? 'bg-surface-container-highest text-on-surface shadow-md' : 'text-on-surface-variant hover:text-on-surface opacity-50'}`}
                  >
                    <span className="material-symbols-outlined text-lg">light_mode</span>
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Pomodoro Config */}
              <div className="bg-surface-container-lowest p-6 rounded-xl space-y-6 border border-outline-variant/5 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Timer Duration</label>
                  <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">{localTimer}:00</span>
                </div>
                <input 
                  className="w-full accent-primary bg-surface-container-high rounded-full h-1.5 appearance-none cursor-pointer" 
                  type="range" 
                  min="15"
                  max="60"
                  step="5"
                  value={localTimer}
                  onChange={(e) => setLocalTimer(parseInt(e.target.value, 10))}
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
                  <span>15m</span>
                  <span>60m</span>
                </div>
              </div>

              {/* Sounds */}
              <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 border border-outline-variant/5 shadow-inner">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 block">Notification Sound</label>
                <div className="relative">
                  <select 
                    value={notificationSound}
                    onChange={(e) => setNotificationSound(e.target.value)}
                    className="w-full bg-surface-container px-5 py-3.5 rounded-xl cursor-pointer hover:bg-surface-container-high hover:border-outline-variant/20 border border-transparent transition-all shadow-sm text-on-surface font-bold outline-none appearance-none pr-10"
                  >
                    <option value="Zen Chime">Zen Chime</option>
                    <option value="Digital Beep">Digital Beep</option>
                    <option value="Soft Ping">Soft Ping</option>
                  </select>
                  <span className="material-symbols-outlined text-primary text-xl absolute right-5 top-3.5 pointer-events-none">volume_up</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Integrations" && (
          <section className="md:col-span-12 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500">terminal</span>
              Connected Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#24292e] rounded-xl flex items-center justify-center">
                    <svg height="24" width="24" viewBox="0 0 16 16" fill="white"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">GitHub</h3>
                    <p className="text-on-surface-variant text-sm">Automate tracking via Commits and PRs.</p>
                  </div>
                </div>
                <button 
                  onClick={() => signIn('github', { callbackUrl: '/settings' })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all"
                >
                  Connect
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Billing" && (
          <section className="md:col-span-12 bg-surface-container-low rounded-2xl p-12 border border-outline-variant/10 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">redeem</span>
            </div>
            <h2 className="text-3xl font-black text-on-surface mb-2">It&apos;s Free for Ever</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">FocusDev is open-source and free. We removed all paid features because clarity shouldn&apos;t have a price tag.</p>
          </section>
        )}
      </div>

      <div className="mt-16 flex justify-end gap-6 pb-12">
        <button className="px-10 py-4 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
          Discard Changes
        </button>
        <button 
          onClick={saveSettings}
          className="px-12 py-4 rounded-xl font-black bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Save All Settings
        </button>
      </div>
    </main>
  );
}
