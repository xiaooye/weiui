"use client";

import { useEffect, useState } from "react";
import { type Theme, THEME_STORAGE_KEY, resolveTheme } from "../../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system";
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    if (theme === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = mq.matches ? "dark" : "light";
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const cycle = () =>
    setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"));

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const icon = theme === "light" ? "☀" : theme === "dark" ? "☾" : "⌘";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      className="wui-theme-toggle"
      suppressHydrationWarning
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
