"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "history", active: pathname === "/dashboard" },
    { name: "Checklists", href: "/checklists", icon: "fact_check", active: pathname === "/checklists" },
    { name: "Focus Timer", href: "/timer", icon: "timer", active: pathname === "/timer", fill: true },
    { name: "Documentation", href: "/docs", icon: "menu_book", active: pathname === "/docs" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 p-6 flex flex-col gap-8 bg-[#0e1322] dark:bg-[#0e1322] shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-indigo-500 tracking-tighter leading-none">FocusDev</h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Monolithic Clarity</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 ease-out hover:translate-x-1 rounded-lg ${
              item.active 
                ? "bg-slate-900/80 text-indigo-400 shadow-inner" 
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
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
        <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          Start Deep Work
        </button>
        <div className="h-px bg-white/5 my-4"></div>
        <Link className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors" href="/support">
          <span className="material-symbols-outlined">help</span>
          <span>Support</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors" href="/settings">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
