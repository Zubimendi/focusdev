"use client";

import React from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const saveSettings = () => {
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
        <button className="px-6 py-2.5 rounded-lg text-primary font-bold bg-surface-container-high shadow-lg">Profile</button>
        <button className="px-6 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-semibold">App Preferences</button>
        <button className="px-6 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-semibold">Integrations</button>
        <button className="px-6 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-semibold">Billing</button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Section */}
        <section className="md:col-span-8 bg-surface-container-low rounded-2xl p-8 relative overflow-hidden border border-outline-variant/10">
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

        {/* Subscription Card */}
        <section className="md:col-span-4 bg-surface-container-low rounded-2xl p-8 border-l-4 border-primary border border-outline-variant/10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6 opacity-60">Subscription</h3>
          <div className="space-y-6">
            <div>
              <span className="text-primary font-black text-4xl tracking-tighter">Pro</span>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Unlimited deep work sessions and cloud rituals.</p>
            </div>
            <div className="font-mono text-2xl font-bold text-secondary">
              $12.00<span className="text-sm font-normal text-on-surface-variant">/mo</span>
            </div>
            <div className="pt-6 border-t border-outline-variant/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-bold uppercase tracking-wider">Next billing cycle</span>
                <span className="font-mono text-on-surface bg-surface-container-high px-2 py-1 rounded">OCT 24, 2024</span>
              </div>
            </div>
          </div>
        </section>

        {/* App Preferences */}
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
                <button className="flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-bold shadow-md">
                  <span className="material-symbols-outlined text-lg">dark_mode</span>
                  <span>Dark</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-all font-semibold opacity-50">
                  <span className="material-symbols-outlined text-lg">light_mode</span>
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Pomodoro Config */}
            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-6 border border-outline-variant/5 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Timer Duration</label>
                <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">25:00</span>
              </div>
              <input 
                className="w-full accent-primary bg-surface-container-high rounded-full h-1.5 appearance-none cursor-pointer" 
                type="range" 
                defaultValue="25"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
                <span>15m</span>
                <span>60m</span>
              </div>
            </div>

            {/* Sounds */}
            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 border border-outline-variant/5 shadow-inner">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 block">Notification Sound</label>
              <div className="flex items-center justify-between bg-surface-container px-5 py-3.5 rounded-xl cursor-pointer hover:bg-surface-container-high hover:border-outline-variant/20 border border-transparent transition-all shadow-sm">
                <span className="text-on-surface font-bold">Zen Chime</span>
                <span className="material-symbols-outlined text-primary text-xl">volume_up</span>
              </div>
            </div>
          </div>
        </section>
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
