"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />; // Placeholder to avoid hydration mismatch

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute transition-all duration-300 dark:-translate-y-10 dark:opacity-0 translate-y-0 opacity-100" />
      <Moon className="h-5 w-5 absolute transition-all duration-300 translate-y-10 opacity-0 dark:translate-y-0 dark:opacity-100" />
    </button>
  );
}
