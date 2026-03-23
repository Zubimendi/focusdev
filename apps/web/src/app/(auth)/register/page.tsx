import RegisterForm from "@/components/auth/register-form";
import AuthHero from "@/components/auth/auth-hero";

export default function RegisterPage() {
  return (
    <main className="flex h-screen w-full">
      <AuthHero />
      <section className="w-full lg:w-5/12 bg-[#f8f9fc] dark:bg-surface flex items-center justify-center p-8 lg:p-16">
        <RegisterForm />
      </section>
      
      {/* Branding Dot Overlay */}
      <div className="fixed inset-0 pointer-events-none dot-grid opacity-[0.03] z-[100]"></div>
    </main>
  );
}
