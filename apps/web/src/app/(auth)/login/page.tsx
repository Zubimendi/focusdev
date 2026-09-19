import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
import AuthHero from "@/components/auth/auth-hero";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-background">
      <AuthHero />
      <section className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-16">
        <Suspense fallback={<div className="w-full max-w-sm h-64 animate-pulse rounded-md bg-surface-container" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
