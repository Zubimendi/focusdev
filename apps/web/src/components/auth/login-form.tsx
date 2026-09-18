"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import FocusLogo from "@/components/brand/focus-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (!email.includes("@")) {
      toast.error("Invalid email address");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Authentication failed. Check your credentials.");
      } else {
        toast.success("Welcome back");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred");
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center lg:items-start">
        <div className="mb-5 text-primary lg:hidden">
          <FocusLogo size={32} className="text-primary text-xl" />
        </div>
        <h2
          className="text-2xl tracking-tight text-on-surface mb-1.5"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Sign in
        </h2>
        <p className="text-sm text-on-surface-variant">
          Continue to your FocusDev workspace.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-md border border-error/25 bg-error-container/40 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">
            error
          </span>
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-medium text-on-surface-variant"
              htmlFor="password"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              className="w-full h-9 px-3 pr-10 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-on-surface-variant">
              or
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>

        <p className="pt-4 text-center text-sm text-on-surface-variant">
          No account?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href="/register"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
