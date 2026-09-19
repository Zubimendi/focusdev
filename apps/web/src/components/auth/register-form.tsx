"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import FocusLogo from "@/components/brand/focus-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (name.trim().length < 2) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!email.includes("@")) {
      toast.error("Invalid email address");
      return false;
    }
    if (
      password.length < 10 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      toast.error(
        "Password needs 10+ chars with upper, lower, number, and special character"
      );
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        toast.error(data.error || "Registration failed. Please try again.");
      } else {
        toast.success("Account created — sign in to continue");
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError("An unexpected error occurred");
      toast.error("Something went wrong. Check your connection.");
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
          Create account
        </h2>
        <p className="text-sm text-on-surface-variant">
          Start tracking projects and deep work.
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
          label="Full name"
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          <label
            className="text-xs font-medium text-on-surface-variant"
            htmlFor="password"
          >
            Password
          </label>
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
          {loading ? "Creating…" : "Create account"}
        </Button>

        <p className="pt-4 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
