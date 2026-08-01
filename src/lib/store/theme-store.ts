/**
 * Aspidus — Theme Customization Store
 * Extends next-themes with custom accent colors and themes
 */
"use client";

import { create } from "zustand";

export type ThemeAccent = "emerald" | "ocean" | "sunset" | "rose" | "violet";

export interface ThemeConfig {
  accent: ThemeAccent;
  radius: number; // 0.5 - 1.0
  sidebarDark: boolean;
}

const ACCENT_MAP: Record<ThemeAccent, { light: string; dark: string; h: number }> = {
  emerald: { light: "oklch(0.455 0.125 170)", dark: "oklch(0.675 0.135 168)", h: 170 },
  ocean:   { light: "oklch(0.455 0.125 220)", dark: "oklch(0.675 0.135 218)", h: 220 },
  sunset:  { light: "oklch(0.555 0.155 35)",  dark: "oklch(0.735 0.155 33)",  h: 35 },
  rose:    { light: "oklch(0.495 0.155 350)", dark: "oklch(0.695 0.155 348)", h: 350 },
  violet:  { light: "oklch(0.495 0.155 290)", dark: "oklch(0.695 0.155 288)", h: 290 },
};

const ACCENT_LABELS: Record<ThemeAccent, string> = {
  emerald: "Emerald",
  ocean: "Ocean",
  sunset: "Sunset",
  rose: "Rose",
  violet: "Violet",
};

export { ACCENT_MAP, ACCENT_LABELS };

interface ThemeCustomState {
  config: ThemeConfig;
  setConfig: (c: Partial<ThemeConfig>) => void;
  applyTheme: () => void;
}

function loadConfig(): ThemeConfig {
  if (typeof window === "undefined") return { accent: "emerald", radius: 0.75, sidebarDark: true };
  try {
    const saved = localStorage.getItem("aspidus-theme-config");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { accent: "emerald", radius: 0.75, sidebarDark: true };
}

export const useThemeCustomStore = create<ThemeCustomState>((set, get) => ({
  config: loadConfig(),
  setConfig: (partial) => {
    const config = { ...get().config, ...partial };
    if (typeof window !== "undefined") localStorage.setItem("aspidus-theme-config", JSON.stringify(config));
    set({ config });
    // Apply immediately
    applyThemeVars(config);
  },
  applyTheme: () => {
    applyThemeVars(get().config);
  },
}));

function applyThemeVars(config: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const accent = ACCENT_MAP[config.accent];
  if (!accent) return;

  // Light mode primary
  root.style.setProperty("--primary", accent.light);
  root.style.setProperty("--primary-foreground", `oklch(0.99 0.002 ${accent.h})`);
  root.style.setProperty("--ring", accent.light);
  root.style.setProperty("--accent-color", `oklch(0.948 0.012 ${accent.h})`);
  root.style.setProperty("--accent-foreground", `oklch(0.285 0.045 ${accent.h})`);
  root.style.setProperty("--chart-1", accent.light);

  // Dark mode primary
  root.style.setProperty("--primary-dark", accent.dark);
  root.style.setProperty("--ring-dark", accent.dark);
  root.style.setProperty("--chart-1-dark", accent.dark);

  // Sidebar primary
  root.style.setProperty("--sidebar-primary", `oklch(0.595 0.135 ${accent.h})`);
  root.style.setProperty("--sidebar-ring", `oklch(0.595 0.135 ${accent.h})`);

  // Radius
  root.style.setProperty("--radius", `${config.radius}rem`);
}
