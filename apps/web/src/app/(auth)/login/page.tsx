import LoginForm from "@/components/auth/login-form";
import AuthHero from "@/components/auth/auth-hero";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-background">
      <AuthHero />
      <section className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-16">
        <LoginForm />
      </section>
    </main>
  );
}
