"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SideNavBar({ isOpen = false, onClose }: SideNavBarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard", active: pathname === "/dashboard" },
    { name: "Checklists", href: "/checklists", icon: "fact_check", active: pathname === "/checklists" },
    { name: "Timer", href: "/timer", icon: "timer", active: pathname === "/timer", fill: true },
    { name: "Stats", href: "/stats", icon: "bar_chart", active: pathname === "/stats" },
    { name: "Projects", href: "/projects", icon: "folder_open", active: pathname === "/projects" },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 p-6 flex flex-col gap-8 bg-surface-container-lowest shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {onClose && (
        <button 
          onClick={onClose}
          className="md:hidden absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tighter leading-none pr-8">FocusDev</h1>
          <p className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase mt-1">Monolithic Clarity</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 ease-out hover:translate-x-1 rounded-lg ${
              item.active 
                ? "bg-primary/10 text-primary shadow-inner dark:bg-primary/20" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: item.fill || item.active ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <Link 
          href="/new-session"
          className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          Start Deep Work
        </Link>
        <div className="my-2"></div>
        <Link 
            className={`flex items-center gap-3 px-4 py-2 transition-all rounded-lg ${pathname === "/support" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`} 
          href="/support"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/support" ? "'FILL' 1" : "'FILL' 0" }}>help</span>
          <span>Support</span>
        </Link>
        <Link 
            className={`flex items-center gap-3 px-4 py-2 transition-all rounded-lg ${pathname === "/settings" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`} 
          href="/settings"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/settings" ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
