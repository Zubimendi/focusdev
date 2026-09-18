import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Outfit, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/auth/session-provider";
import { Toaster } from "sonner";
import ClientThemeProvider from "@/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FocusDev",
  description: "Personal daily project management for focused builders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const settings = JSON.parse(localStorage.getItem('focusdev-settings'));
                const theme = settings?.state?.theme || 'light';
                document.documentElement.classList.add(theme);
              } catch (e) {
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-body bg-surface text-on-surface antialiased`}
        style={
          {
            "--font-landing-display": "var(--font-fraunces)",
            "--font-landing-sans": "var(--font-outfit)",
          } as CSSProperties
        }
      >
        <NextAuthSessionProvider>
          <ClientThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              theme="system"
              toastOptions={{
                style: {
                  background: "var(--surface-container-lowest)",
                  borderColor: "var(--border)",
                  color: "var(--on-surface)",
                },
              }}
            />
          </ClientThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
