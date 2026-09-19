"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  readAt?: string | null;
  createdAt: string;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = window.setInterval(fetchNotifications, 60_000);
    return () => window.clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, [open, fetchNotifications]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    });
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const onItemClick = async (n: NotificationItem) => {
    if (!n.readAt) await markRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-md"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <span
          className="material-symbols-outlined text-[20px] leading-none"
          style={{ fontSize: 20, lineHeight: 1 }}
        >
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-on-primary text-[9px] font-medium flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[min(100vw-2rem,22rem)] z-50">
          <Panel padded={false} className="overflow-hidden shadow-none">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
              <span className="text-xs font-medium text-on-surface">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[min(60vh,320px)] overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-3 py-6 text-xs text-on-surface-variant text-center">
                  Loading…
                </p>
              ) : items.length === 0 ? (
                <p className="px-3 py-6 text-xs text-on-surface-variant text-center">
                  No notifications yet
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onItemClick(n)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-surface-container transition-colors ${
                          !n.readAt ? "bg-primary/[0.04]" : ""
                        }`}
                      >
                        <div className="flex gap-2">
                          {!n.readAt && (
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <div className={!n.readAt ? "" : "pl-3.5"}>
                            <p className="text-xs font-medium text-on-surface line-clamp-1">
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                                {n.body}
                              </p>
                            )}
                            <p className="text-[10px] text-on-surface-variant/80 mt-1">
                              {formatWhen(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
