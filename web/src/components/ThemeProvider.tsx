"use client";

import { useEffect } from "react";

const VALID_THEMES = ["nature", "classic", "earth"] as const;
type Theme = (typeof VALID_THEMES)[number];

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch("/api/theme");
        if (!res.ok) return;
        const { theme } = await res.json();
        if (VALID_THEMES.includes(theme) && theme !== "nature") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      } catch {
        // Default theme (nature) — no attribute needed
      }
    }
    loadTheme();
  }, []);

  return <>{children}</>;
}
