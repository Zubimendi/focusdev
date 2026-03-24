"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        toast.error(data.error || "Registration failed. Please try again.");
      } else {
        toast.success("Account created successfully! Redirecting to login...");
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError("An unexpected error occurred");
      toast.error("System error during registration. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-surface-container-low p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] lg:shadow-none lg:bg-transparent">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center lg:items-start text-on-surface">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="text-2xl font-black tracking-tighter dark:text-on-surface text-slate-900">FocusDev</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-on-surface tracking-tight mb-2">Create an Account</h2>
        <p className="text-slate-500 dark:text-on-surface-variant">Join our high-performance developer community.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error/20 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-xl">error</span>
          <p className="text-error text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant" htmlFor="name">Full Name</label>
          <input
            className="w-full px-4 py-3 rounded-lg border-0 bg-slate-100 dark:bg-surface-container-lowest text-slate-900 dark:text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            id="name"
            placeholder="John Doe"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant" htmlFor="email">Email Address</label>
          <input
            className="w-full px-4 py-3 rounded-lg border-0 bg-slate-100 dark:bg-surface-container-lowest text-slate-900 dark:text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            id="email"
            placeholder="name@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5 text-on-surface">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant" htmlFor="password">Password</label>
          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-12 rounded-lg border-0 bg-slate-100 dark:bg-surface-container-lowest text-slate-900 dark:text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary-container hover:bg-secondary text-white font-bold py-3.5 rounded-lg shadow-lg shadow-secondary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="pt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-on-surface-variant font-medium">
            Already have an account? 
            <Link className="text-primary font-bold hover:underline ml-1" href="/login">Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
