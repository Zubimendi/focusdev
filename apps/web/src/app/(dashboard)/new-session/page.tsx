"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

export default function NewSessionPage() {
  const [task, setTask] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!task) {
      toast.error("Please define your work before heading into the abyss.");
      return;
    }
    toast.success("Initialization sequence complete. Redirecting to deep work...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 lg:px-10 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 flex flex-col gap-6">
          <PageHeader
            title="New session"
            description="Define what you are working on before you start."
            className="!mb-0"
          />

          <nav className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary text-on-primary text-sm font-mono font-medium">
                1
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">Define work</span>
                <span className="text-xs text-on-surface-variant">Core task for this block</span>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-container-high border border-[var(--border)] text-sm font-mono">
                2
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">Set goal</span>
                <span className="text-xs text-on-surface-variant">Target outcome</span>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-container-high border border-[var(--border)] text-sm font-mono">
                3
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">Launch</span>
                <span className="text-xs text-on-surface-variant">Review and start</span>
              </div>
            </div>
          </nav>

          <Panel className="!p-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The secret to deep work is clarity about what you are focusing on.
            </p>
          </Panel>
        </div>

        <Panel className="md:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">
              What are you working on?
            </label>
            <input
              className="w-full h-11 px-3 rounded-md bg-surface border border-[var(--border)] text-on-surface text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. Refactoring auth middleware"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant">Quick tags</span>
            <div className="flex flex-wrap gap-2">
              {["Frontend", "Backend", "System design", "Debugging"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-container-high border border-[var(--border)] text-on-surface hover:bg-surface-container transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border)]">
            <label className="text-sm font-medium text-on-surface">
              Session goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-md border border-[var(--border)] bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    check_circle
                  </span>
                  <span className="text-sm font-medium text-on-surface">Complete task</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Focus until the current work is merged or stable.
                </p>
              </div>
              <div className="p-4 rounded-md border border-primary bg-primary/5 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    timer
                  </span>
                  <span className="text-sm font-medium text-on-surface">Deep focus (90m)</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Uninterrupted coding block with flow tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <Link
              href="/dashboard"
              className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Cancel
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-on-surface-variant hidden sm:inline">
                Step 1 of 3
              </span>
              <Button type="button" onClick={handleStart}>
                Go deep
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
