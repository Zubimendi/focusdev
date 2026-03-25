"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings";

export default function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
