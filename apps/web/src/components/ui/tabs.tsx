"use client";

import React from "react";

export interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-0.5 p-0.5 rounded-md bg-surface-container-low border border-[var(--border)] w-fit ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isActive
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
