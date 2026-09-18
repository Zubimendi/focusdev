"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FocusLogo from "@/components/brand/focus-logo";

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SideNavBar({ isOpen = false, onClose }: SideNavBarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Checklists", href: "/checklists", icon: "fact_check" },
    { name: "Timer", href: "/timer", icon: "timer", fill: true },
    { name: "Stats", href: "/stats", icon: "bar_chart" },
    { name: "Projects", href: "/projects", icon: "folder_open" },
    { name: "Weekly Review", href: "/reviews/week", icon: "rate_review" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[var(--sidebar-width)] flex flex-col bg-surface-container-lowest border-r border-[var(--border)] z-50 transition-transform duration-200 ease-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}

      <div className="px-4 pt-5 pb-4 text-primary">
        <FocusLogo size={28} className="text-primary text-base" />
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{
                  fontVariationSettings:
                    item.fill || active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-3 pt-2 border-t border-[var(--border)] flex flex-col gap-0.5">
        <Link
          href="/new-session"
          onClick={onClose}
          className="mx-0.5 mb-2 flex items-center justify-center gap-1.5 h-8 rounded-md bg-primary text-on-primary text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          Start focus
        </Link>
        <Link
          href="/support"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
            pathname === "/support"
              ? "bg-primary/10 text-primary font-medium"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Support
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
            pathname === "/settings"
              ? "bg-primary/10 text-primary font-medium"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Settings
        </Link>
      </div>
    </aside>
  );
}
