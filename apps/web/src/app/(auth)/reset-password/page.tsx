"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import FocusLogo from "@/components/brand/focus-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Request a new link.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn’t reset password");
        return;
      }
      toast.success("Password updated");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-primary">
        <FocusLogo size={32} className="text-primary text-xl" />
      </div>
      <h1
        className="text-2xl tracking-tight text-on-surface mb-1.5"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Choose a new password
      </h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Use at least 10 characters with upper, lower, number, and special
        character.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Update password
        </Button>
        <p className="text-center text-sm text-on-surface-variant">
          <Link href="/forgot-password" className="text-primary font-medium hover:underline">
            Request a new link
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<p className="text-sm text-on-surface-variant">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
