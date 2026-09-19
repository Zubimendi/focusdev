"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import FocusLogo from "@/components/brand/focus-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      setDone(true);
      toast.success("Check your email for reset instructions");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-primary">
          <FocusLogo size={32} className="text-primary text-xl" />
        </div>
        <h1
          className="text-2xl tracking-tight text-on-surface mb-1.5"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Reset password
        </h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Enter your email and we&apos;ll send a reset link if an account
          exists.
        </p>

        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-on-surface">
              If an account exists for that email, reset instructions are on
              the way. Check your inbox (and spam).
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send reset link
            </Button>
            <p className="text-center text-sm text-on-surface-variant">
              <Link href="/login" className="text-primary font-medium hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
