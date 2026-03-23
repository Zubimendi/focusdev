import LoginForm from "@/components/auth/login-form";
import AuthHero from "@/components/auth/auth-hero";

export default function LoginPage() {
  return (
    <main className="flex h-screen w-full">
      <AuthHero />
      <section className="w-full lg:w-5/12 bg-[#f8f9fc] dark:bg-surface flex items-center justify-center p-8 lg:p-16">
        <LoginForm />
      </section>
      
      {/* Branding Dot Overlay */}
      <div className="fixed inset-0 pointer-events-none dot-grid opacity-[0.03] z-[100]"></div>
    </main>
  );
}
