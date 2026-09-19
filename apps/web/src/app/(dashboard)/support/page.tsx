"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@focusdev.app";

const FAQ = [
  {
    id: "focus",
    q: "How do I start a focus session?",
    a: "From the Dashboard or Timer, name what you’re working on (optionally pick a project) and start. When you stop, the minutes count toward Stats and reviews.",
    href: "/timer",
    linkLabel: "Open timer",
  },
  {
    id: "github",
    q: "How do GitHub commits count toward goals?",
    a: "Connect GitHub in Settings → Integrations, link a repo on a project, give the goal a commit tag, then push with [fd:tag] in the commit subject. Sync on the project page to attribute commits.",
    href: "/settings",
    linkLabel: "Open settings",
  },
  {
    id: "reviews",
    q: "What are weekly and monthly reviews?",
    a: "They snapshot your focus minutes, sessions, tasks, and goals for the period, then let you score goals and write a short reflection. Use them like a personal performance review.",
    href: "/reviews/week",
    linkLabel: "Weekly review",
  },
  {
    id: "charts",
    q: "Can I turn off Stats charts?",
    a: "Yes. In Settings → Preferences, toggle Performance charts off. Stats then loads summary numbers only and skips heatmap, trends, and GitHub activity fetches.",
    href: "/settings",
    linkLabel: "Open preferences",
  },
  {
    id: "2fa",
    q: "Is two-factor authentication required?",
    a: "No. 2FA is optional. You can set it up anytime under Settings → Security with an authenticator app.",
    href: "/settings",
    linkLabel: "Security settings",
  },
  {
    id: "export",
    q: "How do I export or delete my data?",
    a: "Settings → Data lets you download a JSON export of your account data, or permanently delete your account after confirming your password.",
    href: "/settings",
    linkLabel: "Data settings",
  },
];

const TOPICS = [
  {
    icon: "timer",
    title: "Focus & timer",
    body: "Sessions, streaks, and deep-work blocks.",
    href: "/timer",
  },
  {
    icon: "folder_open",
    title: "Projects & goals",
    body: "Link repos and track OKRs.",
    href: "/projects",
  },
  {
    icon: "bar_chart",
    title: "Stats & reviews",
    body: "Performance charts and period close.",
    href: "/stats",
  },
  {
    icon: "settings",
    title: "Account & security",
    body: "Profile, 2FA, export, and prefs.",
    href: "/settings",
  },
] as const;

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("focus");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [query]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Add a subject and a short description.");
      return;
    }
    setSending(true);
    try {
      const body = [
        `Category: ${category}`,
        "",
        message.trim(),
        "",
        "— Sent from FocusDev Support",
      ].join("\n");
      const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        subject.trim()
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      toast.success("Opening your email client…");
      setSubject("");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success("Support email copied");
    } catch {
      toast.message(SUPPORT_EMAIL);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 lg:px-10 flex flex-col gap-8 w-full">
      <PageHeader
        title="Support"
        description="Answers for FocusDev features, plus a way to reach us when you need a human."
      />

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          className="w-full h-10 pl-10 pr-3 rounded-md bg-surface border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Search help…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOPICS.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="flex items-start gap-3 p-4 rounded-md border border-[var(--border)] bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
              {t.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-surface">{t.title}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{t.body}</p>
            </div>
          </Link>
        ))}
      </section>

      <Panel className="flex flex-col gap-1 !p-2">
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-sm font-medium text-on-surface">
            Frequently asked
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-sm text-on-surface-variant text-center">
            No matches. Try a different search or send a message below.
          </p>
        ) : (
          filtered.map((item) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-md border border-transparent hover:border-[var(--border)] hover:bg-surface-container-low transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left"
                >
                  <span className="flex-1 text-sm font-medium text-on-surface">
                    {item.q}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    {open ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {open && (
                  <div className="px-3 pb-3 flex flex-col gap-2">
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {item.a}
                    </p>
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-primary hover:underline w-fit"
                    >
                      {item.linkLabel} →
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </Panel>

      <Panel className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-medium text-on-surface">Contact us</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Opens your email client to{" "}
            <button
              type="button"
              onClick={copyEmail}
              className="font-mono text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </button>
            . No fake ticket queue — we reply by email.
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary"
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-on-surface-variant">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="technical">Technical issue</option>
              <option value="account">Account & security</option>
              <option value="github">GitHub / goals</option>
              <option value="feature">Feature idea</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-on-surface-variant">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none min-h-[120px]"
              placeholder="What happened, and what did you expect?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={sending} className="w-full sm:w-auto">
            Compose email
          </Button>
        </form>
      </Panel>
    </main>
  );
}
