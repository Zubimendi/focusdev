"use client";

import React, { useEffect, useId, useRef } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Selector or "first-input" — defaults to first text field inside the panel */
  initialFocus?: "first-input" | "none";
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
  initialFocus = "first-input",
}: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus once on open — prefer first input/textarea, never the close button
    const id = window.requestAnimationFrame(() => {
      if (initialFocus === "none") return;
      const panel = panelRef.current;
      if (!panel) return;
      const preferred = panel.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
      );
      preferred?.focus();
    });

    return () => {
      window.cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
    // Only re-run when open flips — not when parent re-renders from typing
  }, [open, initialFocus]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] shadow-none ${className}`}
      >
        <div className="px-5 pt-5 pb-3 border-b border-[var(--border)]">
          <h2
            id={titleId}
            className="text-sm font-medium text-on-surface pr-8"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="absolute top-4 right-4 p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-on-surface-variant">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
