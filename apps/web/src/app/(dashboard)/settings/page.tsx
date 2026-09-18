"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import { useSettingsStore } from "@/store/settings";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TABS = ["Profile", "Preferences", "Integrations", "Billing"] as const;

export default function SettingsPage() {
  const { data: session, update: updateSession, status } = useSession();
  const {
    theme,
    setTheme,
    timerDuration,
    setTimerDuration,
    notificationSound,
    setNotificationSound,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [localTimer, setLocalTimer] = useState(timerDuration);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session?.user]);

  useEffect(() => {
    setLocalTimer(timerDuration);
  }, [timerDuration]);

  const avatarInitial = (name || email || "?").charAt(0).toUpperCase();

  const saveProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }
      await updateSession({ name: data.user.name });
      toast.success("Profile updated");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = () => {
    setTimerDuration(localTimer);
    toast.success("Preferences saved");
  };

  return (
    <main className="flex-1 px-6 py-8 lg:px-10 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Settings"
        description="Account, workspace preferences, and integrations."
      />

      <Tabs
        tabs={[...TABS]}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />

      {activeTab === "Profile" && (
        <Panel>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl font-medium shrink-0">
              {status === "loading" ? "…" : avatarInitial}
            </div>
            <div className="flex-1 w-full space-y-5">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={status === "loading"}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                readOnly
                disabled
                hint="Email cannot be changed here."
              />
              <Button
                onClick={saveProfile}
                loading={savingProfile}
                disabled={status === "loading"}
              >
                Update profile
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "Preferences" && (
        <Panel>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-medium text-on-surface-variant">
                Appearance
              </label>
              <div className="flex gap-1 p-1 rounded-md bg-surface-container-low border border-[var(--border)] w-fit">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-on-surface-variant">
                  Timer duration
                </label>
                <span className="font-mono text-sm text-primary">
                  {localTimer}:00
                </span>
              </div>
              <input
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer"
                type="range"
                min={15}
                max={60}
                step={5}
                value={localTimer}
                onChange={(e) => setLocalTimer(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>15m</span>
                <span>60m</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-on-surface-variant">
                Notification sound
              </label>
              <select
                value={notificationSound}
                onChange={(e) => setNotificationSound(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="Zen Chime">Zen Chime</option>
                <option value="Digital Beep">Digital Beep</option>
                <option value="Soft Ping">Soft Ping</option>
              </select>
            </div>

            <Button onClick={savePreferences}>Save preferences</Button>
          </div>
        </Panel>
      )}

      {activeTab === "Integrations" && (
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#24292e] rounded-md flex items-center justify-center shrink-0">
                <svg height="18" width="18" viewBox="0 0 16 16" fill="white">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-on-surface">GitHub</h3>
                <p className="text-xs text-on-surface-variant">
                  Track commits and PRs against your focus sessions.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => signIn("github", { callbackUrl: "/settings" })}
            >
              Connect
            </Button>
          </div>
        </Panel>
      )}

      {activeTab === "Billing" && (
        <Panel className="text-center py-10">
          <h2 className="font-headline text-xl text-on-surface mb-2">
            Free forever
          </h2>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            FocusDev is open-source. Clarity shouldn&apos;t have a price tag.
          </p>
        </Panel>
      )}
    </main>
  );
}
