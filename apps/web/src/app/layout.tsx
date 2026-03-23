import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // Using Next.js Google Fonts
import "./globals.css";
import NextAuthSessionProvider from "@/components/auth/session-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "FocusDev",
  description: "Boost your productivity with monolithic clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-body bg-surface text-on-surface antialiased`}>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
