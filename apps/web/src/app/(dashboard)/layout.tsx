"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SideNavBar from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ProductTour } from "@/components/onboarding/product-tour";

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const isFocusedTask = pathname === "/new-session";

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md px-6 flex flex-col gap-4">
          <div className="h-8 w-36 rounded-md bg-surface-container-high animate-pulse" />
          <div className="h-40 rounded-md bg-surface-container-high animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-md bg-surface-container-high animate-pulse" />
            <div className="h-20 rounded-md bg-surface-container-high animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container flex overflow-hidden">
      {!isFocusedTask && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {!isFocusedTask && (
        <SideNavBar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`${
          !isFocusedTask ? "md:ml-[var(--sidebar-width)]" : ""
        } flex flex-col min-h-screen w-full flex-1 overflow-x-hidden`}
      >
        {!isFocusedTask && (
          <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-[var(--border)]">
            <div className="flex justify-between items-center w-full px-4 md:px-6 h-12">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 -ml-1 text-on-surface-variant hover:bg-surface-container transition-colors rounded-md"
                aria-label="Open menu"
              >
                <span className="material-symbols-outlined text-[20px]">
                  menu
                </span>
              </button>
              <div className="hidden md:block" />
              <div className="flex items-center gap-0.5 ml-auto h-8">
                <NotificationBell />
                <Link
                  href="/settings"
                  data-tour="nav-settings-header"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-md"
                  aria-label="Settings"
                >
                  <span
                    className="material-symbols-outlined text-[20px] leading-none"
                    style={{ fontSize: 20, lineHeight: 1 }}
                  >
                    settings
                  </span>
                </Link>
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[var(--border)] h-8">
                  <div className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center overflow-hidden relative shrink-0 self-center">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[11px] font-medium text-primary leading-none">
                        {initial}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="h-7 px-2 inline-flex items-center text-xs font-medium text-on-surface-variant hover:text-error transition-colors rounded-md hover:bg-surface-container"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {children}
        {!isFocusedTask && <ProductTour />}
      </div>
    </div>
  );
}
