"use client";

import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { createContext, useContext, useLayoutEffect, useSyncExternalStore } from "react";

export type ThemeName = "dark" | "light";

const STORAGE_KEY = "cap-theme";
const EVENT = "cap-theme";

const themeBoot = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}`;

function readTheme(): ThemeName {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(EVENT));
}

const ThemeContext = createContext<{
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as ThemeName);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
      window.dispatchEvent(new Event(EVENT));
    }
    document.documentElement.classList.add("theme-ready");
  }, []);

  const setTheme = (next: ThemeName) => applyTheme(next);
  const toggle = () => applyTheme(readTheme() === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      onClick={toggle}
      className="relative h-9 w-16 shrink-0 rounded-full border border-[var(--stroke)] bg-[var(--chip)]"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[var(--muted)]">
        <Moon size={14} />
        <Sun size={14} />
      </span>
      <motion.span
        aria-hidden
        className="absolute top-1 h-7 w-7 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(138,43,226,0.65)]"
        initial={false}
        animate={{ left: light ? 32 : 4 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
      />
    </button>
  );
}
