"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Authentication failed. Please check your credentials.");
      } else {
        toast.success("Welcome back! Redirecting to dashboard...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred");
      toast.error("System error during sign in. Please try again later.");
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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-on-surface tracking-tight mb-2">Welcome to FocusDev</h2>
        <p className="text-slate-500 dark:text-on-surface-variant">Log in to your high-performance workspace.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error/20 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-xl">error</span>
          <p className="text-error text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant" htmlFor="password">Password</label>
            <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
          </div>
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
          className="w-full bg-primary-container hover:bg-primary text-on-primary-container font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-outline-variant/20"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-surface-container-low lg:bg-surface px-4 text-slate-400 dark:text-on-surface-variant font-bold tracking-widest">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 bg-[#1a1f2f] hover:bg-[#25293a] text-white py-3 rounded-lg font-semibold active:scale-[0.98] transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
            GitHub
          </button>
          <button type="button" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-semibold active:scale-[0.98] transition-all dark:bg-surface-container-lowest dark:border-outline-variant/20 dark:text-on-surface text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
            Google
          </button>
        </div>

        <div className="pt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-on-surface-variant font-medium">
            Don&apos;t have an account? 
            <Link className="text-primary font-bold hover:underline ml-1" href="/register">Create an account</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
