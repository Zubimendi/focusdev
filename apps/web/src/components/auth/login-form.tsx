"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import FocusLogo from "@/components/brand/focus-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const OAUTH_ERRORS: Record<string, string> = {
  OAuthSignin:
    "GitHub sign-in isn’t configured. Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and NEXTAUTH_URL on the server.",
  OAuthCallback: "GitHub sign-in failed during callback. Check the OAuth app callback URL.",
  OAuthCreateAccount: "Couldn’t create an account from GitHub. Try again or use email.",
  Callback: "Sign-in callback failed. Try again.",
  OAuthAccountNotLinked:
    "This GitHub email is already used with a password account. Sign in with email, then connect GitHub in Settings.",
  Default: "GitHub sign-in failed. Try email login or reconnect later.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const message = OAUTH_ERRORS[err] || OAUTH_ERRORS.Default;
    setError(message);
    toast.error(message);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        totpCode: needs2FA ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("2FA_REQUIRED") || result.error === "2FA_REQUIRED") {
          setNeeds2FA(true);
          setError("");
          toast.message("Enter your authenticator code");
        } else if (needs2FA) {
          setError("Invalid verification code");
          toast.error("Invalid verification code");
        } else {
          // Probe mobile login API for requires2FA (NextAuth can't return custom payloads)
          const probe = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail, password }),
          });
          const data = await probe.json();
          if (data.requires2FA) {
            setNeeds2FA(true);
            toast.message("Enter your authenticator code");
          } else {
            setError("Invalid email or password");
            toast.error("Couldn’t sign you in");
          }
        }
      } else {
        toast.success("Welcome back");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong");
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
          {needs2FA ? "Verify it’s you" : "Sign in"}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {needs2FA
            ? "Enter the 6-digit code from your authenticator app."
            : "Continue to your FocusDev workspace."}
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
        {!needs2FA ? (
          <>
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="you@email.com"
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
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
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
          </>
        ) : (
          <Input
            label="Authenticator code"
            id="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {needs2FA ? "Verify" : "Sign in"}
        </Button>

        {!needs2FA && (
          <>
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
          </>
        )}
      </form>
    </div>
  );
}
