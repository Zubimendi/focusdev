import LoginForm from "@/components/auth/login-form";
import AuthHero from "@/components/auth/auth-hero";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#f8f9fc] dark:bg-surface">
      <AuthHero />
      <section className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-16 py-12 md:py-20">
        <LoginForm />
      </section>
      
      {/* Branding Dot Overlay */}
      <div className="fixed inset-0 pointer-events-none dot-grid opacity-[0.03] z-[100]"></div>
    </main>
  );
}
