/**
 * Aspidus — i18n Store (Zustand)
 * Client-side language switching with persistence
 */
"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/i18n/dictionaries";
import { t as translate } from "@/lib/i18n/dictionaries";

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: (typeof window !== "undefined" && localStorage.getItem("aspidus-locale") as Locale) || "en",
  setLocale: (locale) => {
    if (typeof window !== "undefined") localStorage.setItem("aspidus-locale", locale);
    set({ locale });
  },
}));

/** Hook-friendly translation helper */
export function useT() {
  const locale = useI18nStore((s) => s.locale);
  return (key: string) => translate(locale, key);
}

/** Direct translation (for non-React contexts) */
export function getT(locale: Locale) {
  return (key: string) => translate(locale, key);
}
