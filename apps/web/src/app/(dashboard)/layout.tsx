"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SideNavBar from "@/components/dashboard/sidebar";

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
    return <div className="flex h-screen items-center justify-center bg-background text-on-surface">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container flex overflow-hidden">
      {/* Mobile overlay */}
      {!isFocusedTask && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {!isFocusedTask && (
        <SideNavBar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <div className={`${!isFocusedTask ? 'md:ml-64' : ''} flex flex-col min-h-screen w-full flex-1 overflow-x-hidden`}>
        {/* TopNavBar Replacement (Suppressed in Focused Tasks) */}
        {!isFocusedTask && (
          <header className="bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-[1920px] mx-auto">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-lg active:scale-95"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-lg active:scale-95">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <Link href="/settings" className="p-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-lg active:scale-95">
                  <span className="material-symbols-outlined">settings</span>
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <div className="ring-2 ring-primary/20 rounded-full p-0.5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden relative">
                      {user?.image ? (
                        <Image src={user.image} alt="User Avatar" fill className="object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{user?.name?.[0] || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="text-xs font-bold text-on-surface-variant hover:text-error transition-colors uppercase tracking-widest"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {children}
      </div>
    </div>
  );
}
