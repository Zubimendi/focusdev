"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/store/settings";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const TABS = [
  "Profile",
  "Security",
  "Preferences",
  "Notifications",
  "Integrations",
  "Data",
] as const;

interface NotificationPrefs {
  notifyReviewDue: boolean;
  notifyStreakRisk: boolean;
  notifyGoalUpdates: boolean;
  notifyHabitDue: boolean;
  notifySecurity: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession, status } = useSession();
  const {
    theme,
    setTheme,
    timerDuration,
    setTimerDuration,
    notificationSound,
    setNotificationSound,
    showCharts,
    setShowCharts,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [localTimer, setLocalTimer] = useState(timerDuration);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [twoFaSetup, setTwoFaSetup] = useState<{
    qrDataUrl: string;
    secret: string;
  } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    notifyReviewDue: true,
    notifyStreakRisk: true,
    notifyGoalUpdates: true,
    notifyHabitDue: true,
    notifySecurity: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      const u = data.user;
      if (u?.name) setName(u.name);
      if (u?.email) setEmail(u.email);
      setTwoFactorEnabled(Boolean(u?.twoFactorEnabled));
      const p = u?.preferences || {};
      if (p.theme === "light" || p.theme === "dark") setTheme(p.theme);
      if (typeof p.timerDuration === "number") setTimerDuration(p.timerDuration);
      if (typeof p.notificationSound === "string")
        setNotificationSound(p.notificationSound);
      if (typeof p.showCharts === "boolean") setShowCharts(p.showCharts);
      setNotifPrefs({
        notifyReviewDue: p.notifyReviewDue !== false,
        notifyStreakRisk: p.notifyStreakRisk !== false,
        notifyGoalUpdates: p.notifyGoalUpdates !== false,
        notifyHabitDue: p.notifyHabitDue !== false,
        notifySecurity: p.notifySecurity !== false,
      });
    } catch {
      /* ignore */
    }
  }, [setTheme, setTimerDuration, setNotificationSound, setShowCharts]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      loadMe();
    }
  }, [session?.user, loadMe]);

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

  const savePreferences = async () => {
    setSavingPrefs(true);
    setTimerDuration(localTimer);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            theme,
            timerDuration: localTimer,
            notificationSound,
            showCharts,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not save preferences");
        return;
      }
      toast.success("Preferences saved");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const saveNotificationPrefs = async () => {
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: notifPrefs }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not save notification settings");
        return;
      }
      toast.success("Notification settings saved");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingNotifs(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not change password");
        return;
      }
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const start2faSetup = async () => {
    setTwoFaBusy(true);
    setBackupCodes(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not start 2FA setup");
        return;
      }
      setTwoFaSetup({ qrDataUrl: data.qrDataUrl, secret: data.secret });
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setTwoFaBusy(false);
    }
  };

  const enable2fa = async () => {
    setTwoFaBusy(true);
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid code");
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFaSetup(null);
      setTwoFaCode("");
      setBackupCodes(data.backupCodes || []);
      toast.success("Two-factor authentication enabled");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setTwoFaBusy(false);
    }
  };

  const disable2fa = async () => {
    setTwoFaBusy(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: disablePassword,
          ...(disableCode ? { code: disableCode } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not disable 2FA");
        return;
      }
      setTwoFactorEnabled(false);
      setDisablePassword("");
      setDisableCode("");
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setTwoFaBusy(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        toast.error("Export is not available yet");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `focusdev-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Could not export data");
    } finally {
      setExporting(false);
    }
  };

  const replayTour = () => {
    sessionStorage.setItem("focusdev-tour-force", "1");
    localStorage.removeItem("focusdev-tour-dismissed");
    router.push("/dashboard");
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not delete account");
        return;
      }
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const notifToggle = (
    key: keyof NotificationPrefs,
    label: string,
    description: string
  ) => (
    <label className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border)] last:border-0 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={notifPrefs[key]}
        onChange={(e) =>
          setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))
        }
        className="mt-1 accent-primary h-4 w-4 shrink-0"
      />
    </label>
  );

  return (
    <main className="flex-1 px-6 py-8 lg:px-10 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Settings"
        description="Account, security, preferences, and data."
      />

      <Tabs
        tabs={[...TABS]}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-8 flex-wrap"
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

      {activeTab === "Security" && (
        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-medium text-on-surface mb-4">
              Change password
            </h3>
            <div className="space-y-4 max-w-md">
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                onClick={changePassword}
                loading={changingPassword}
                disabled={!currentPassword || !newPassword}
              >
                Update password
              </Button>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-on-surface">
                  Two-factor authentication
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {twoFactorEnabled
                    ? "Optional — currently on. You’ll enter an authenticator code when signing in."
                    : "Optional. Add an authenticator app for extra protection when you want it."}
                </p>
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  twoFactorEnabled
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {twoFactorEnabled ? "On" : "Off"}
              </span>
            </div>

            {backupCodes && backupCodes.length > 0 && (
              <div className="mb-4 p-3 rounded-md bg-surface-container-low border border-[var(--border)]">
                <p className="text-xs font-medium text-on-surface mb-2">
                  Save these backup codes — shown once
                </p>
                <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-on-surface-variant">
                  {backupCodes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {!twoFactorEnabled && !twoFaSetup && (
              <Button onClick={start2faSetup} loading={twoFaBusy}>
                Set up 2FA
              </Button>
            )}

            {!twoFactorEnabled && twoFaSetup && (
              <div className="space-y-4 max-w-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={twoFaSetup.qrDataUrl}
                  alt="Authenticator QR code"
                  className="w-40 h-40 rounded-md border border-[var(--border)]"
                />
                <p className="text-xs text-on-surface-variant break-all">
                  Manual key:{" "}
                  <span className="font-mono text-on-surface">
                    {twoFaSetup.secret}
                  </span>
                </p>
                <Input
                  label="Verification code"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="000000"
                  inputMode="numeric"
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setTwoFaSetup(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={enable2fa} loading={twoFaBusy}>
                    Enable 2FA
                  </Button>
                </div>
              </div>
            )}

            {twoFactorEnabled && (
              <div className="space-y-4 max-w-md">
                <Input
                  label="Password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                <Input
                  label="Authenticator code (optional)"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  hint="Provide a current code if prompted."
                />
                <Button
                  variant="danger"
                  onClick={disable2fa}
                  loading={twoFaBusy}
                  disabled={!disablePassword}
                >
                  Disable 2FA
                </Button>
              </div>
            )}
          </Panel>
        </div>
      )}

      {activeTab === "Preferences" && (
        <Panel>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-medium text-on-surface-variant">
                Appearance
              </label>
              <div className="flex gap-1 p-1 rounded-md bg-surface-container-low border border-[var(--border)] w-fit">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors capitalize ${
                      theme === t
                        ? "bg-surface-container-lowest text-on-surface shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t}
                  </button>
                ))}
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

            <div className="space-y-3">
              <label className="text-xs font-medium text-on-surface-variant">
                Performance charts
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={showCharts}
                onClick={() => setShowCharts(!showCharts)}
                className={`flex items-center justify-between w-full h-11 px-3 rounded-md border border-[var(--border)] bg-surface-container-lowest text-left`}
              >
                <span className="text-sm text-on-surface">
                  {showCharts
                    ? "On — Stats loads charts and GitHub activity"
                    : "Off — Stats shows numbers only (faster)"}
                </span>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                    showCharts ? "bg-primary" : "bg-surface-container-high"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      showCharts ? "left-4" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
              <p className="text-xs text-on-surface-variant">
                Turn off to skip heatmap, trend charts, and GitHub activity
                fetches on Stats.
              </p>
            </div>

            <Button onClick={savePreferences} loading={savingPrefs}>
              Save preferences
            </Button>
          </div>
        </Panel>
      )}

      {activeTab === "Notifications" && (
        <Panel>
          {notifToggle(
            "notifyReviewDue",
            "Weekly & monthly review reminders",
            "Nudge when it is time to close the week or month."
          )}
          {notifToggle(
            "notifyStreakRisk",
            "Streak at risk",
            "Alert when you are close to breaking a focus streak."
          )}
          {notifToggle(
            "notifyGoalUpdates",
            "Goal progress",
            "Updates when goals move forward or need attention."
          )}
          {notifToggle(
            "notifyHabitDue",
            "Habit check-ins",
            "Reminders for habits due today."
          )}
          {notifToggle(
            "notifySecurity",
            "Security alerts",
            "Password changes, 2FA, and sign-in activity."
          )}
          <div className="pt-4">
            <Button onClick={saveNotificationPrefs} loading={savingNotifs}>
              Save notification settings
            </Button>
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
                <p className="text-xs text-on-surface-variant max-w-md">
                  Connect once so FocusDev can attribute structured commits
                  (<span className="font-mono">[fd:tag]</span>) to goals on
                  linked project repos.
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

      {activeTab === "Data" && (
        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-medium text-on-surface mb-1">
              Export your data
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Download a JSON archive of your FocusDev data.
            </p>
            <Button
              variant="secondary"
              onClick={exportData}
              loading={exporting}
            >
              Download export
            </Button>
          </Panel>

          <Panel>
            <h3 className="text-sm font-medium text-on-surface mb-1">
              Product tour
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Walk through dashboard basics again.
            </p>
            <Button variant="secondary" onClick={replayTour}>
              Replay tour
            </Button>
          </Panel>

          <Panel className="border-error/30">
            <h3 className="text-sm font-medium text-error mb-1">
              Delete account
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Permanently remove your account and associated data.
            </p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </Panel>
        </div>
      )}

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              disabled={!deletePassword}
              onClick={deleteAccount}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p>
            This action is permanent. Enter your password to confirm deletion.
          </p>
          <Input
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>
      </Dialog>
    </main>
  );
}
