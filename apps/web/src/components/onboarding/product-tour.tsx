"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const STORAGE_DISMISSED = "focusdev-tour-dismissed";

const STEPS: {
  title: string;
  body: string;
  target?: string;
}[] = [
  {
    title: "Welcome to your dashboard",
    body: "Track focus time, tasks, and streaks from one place. This tour takes under a minute.",
  },
  {
    title: "Create a project",
    body: "Group work by project to see where your focus goes each week.",
    target: '[data-tour="nav-projects"]',
  },
  {
    title: "Start a focus session",
    body: "Jump into deep work anytime with the Start focus button.",
    target: '[data-tour="nav-start-focus"]',
  },
  {
    title: "Weekly review",
    body: "Reflect on wins and blockers once a week to stay aligned.",
    target: '[data-tour="nav-reviews"]',
  },
    {
      title: "Goal-linked GitHub commits",
      body: "Link a repo on a project, add a goal tag, then commit with [fd:tag] so pushes count toward that goal.",
      target: '[data-tour="nav-projects"]',
    },
    {
      title: "Weekly and monthly reviews",
      body: "Close each week and month with real metrics and a short reflection — your personal PMS.",
      target: '[data-tour="nav-reviews"]',
    },
  {
    title: "Secure your account",
    body: "2FA is optional — set it up anytime in Settings when you want extra protection.",
    target: '[data-tour="nav-settings-header"]',
  },
];

function SpotlightRect({
  rect,
}: {
  rect: { top: number; left: number; width: number; height: number };
}) {
  const pad = 6;
  const t = Math.max(0, rect.top - pad);
  const l = Math.max(0, rect.left - pad);
  const w = rect.width + pad * 2;
  const h = rect.height + pad * 2;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="focusdev-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={l} y={t} width={w} height={h} rx="8" fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#focusdev-tour-mask)"
        />
      </svg>
      <div
        className="absolute border border-primary/40 rounded-lg"
        style={{ top: t, left: l, width: w, height: h }}
      />
    </div>
  );
}

export interface ProductTourProps {
  force?: boolean;
}

export function ProductTour({ force = false }: ProductTourProps) {
  const { data: session, update: updateSession } = useSession();
  const [replay, setReplay] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spot, setSpot] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(
    null
  );

  const completeTour = useCallback(async () => {
    localStorage.setItem(STORAGE_DISMISSED, "1");
    setReplay(false);
    setVisible(false);
    try {
      await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
      await updateSession({
        onboardingCompletedAt: new Date().toISOString(),
      });
    } catch {
      /* persist locally even if API pending */
    }
  }, [updateSession]);

  useEffect(() => {
    if (force || sessionStorage.getItem("focusdev-tour-force") === "1") {
      sessionStorage.removeItem("focusdev-tour-force");
      localStorage.removeItem(STORAGE_DISMISSED);
      setReplay(true);
      setStepIndex(0);
      setVisible(true);
    }
  }, [force]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (replay) return;

      if (localStorage.getItem(STORAGE_DISMISSED) === "1") return;

      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        const at = data.user?.onboardingCompletedAt;
        if (at) {
          localStorage.setItem(STORAGE_DISMISSED, "1");
          return;
        }
      } catch {
        /* show tour if we cannot verify */
      }

      if (!cancelled) {
        setStepIndex(0);
        setVisible(true);
      }
    }

    if (session?.user) init();
    return () => {
      cancelled = true;
    };
  }, [session?.user, replay]);

  const step = STEPS[stepIndex];

  useEffect(() => {
    if (!visible || !step) return;

    function measure() {
      if (!step.target) {
        setSpot(null);
        setCardPos(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        setSpot(null);
        setCardPos(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setSpot({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
      const cardTop = Math.min(
        window.innerHeight - 220,
        Math.max(16, r.bottom + 12)
      );
      const cardLeft = Math.min(
        window.innerWidth - 340,
        Math.max(16, r.left)
      );
      setCardPos({ top: cardTop, left: cardLeft });
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [visible, step, stepIndex]);

  if (!visible || !step) return null;

  const isLast = stepIndex === STEPS.length - 1;

  const card = (
    <div
      className="z-[95] w-[min(100vw-2rem,20rem)] bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] p-4 shadow-none pointer-events-auto"
      style={
        cardPos
          ? { position: "fixed", top: cardPos.top, left: cardPos.left }
          : undefined
      }
      role="dialog"
      aria-labelledby="product-tour-title"
    >
      <p className="text-[11px] font-medium text-primary uppercase tracking-wide mb-1">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <h3 id="product-tour-title" className="text-sm font-medium text-on-surface">
        {step.title}
      </h3>
      <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
        {step.body}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={completeTour}
          className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Skip tour
        </button>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStepIndex((i) => i - 1)}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (isLast) completeTour();
              else setStepIndex((i) => i + 1);
            }}
          >
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {spot ? <SpotlightRect rect={spot} /> : (
        <div
          className="fixed inset-0 z-[90] bg-black/55 pointer-events-none"
          aria-hidden
        />
      )}
      {step.target && cardPos ? (
        card
      ) : (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
          {card}
        </div>
      )}
    </>
  );
}
