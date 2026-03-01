"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {theme === "dark" ? (
          <Sun
            size={20}
            weight="bold"
            className="text-accent-gold transition-transform duration-300 hover:rotate-180"
          />
        ) : (
          <Moon
            size={20}
            weight="bold"
            className="text-accent-gold transition-transform duration-300 hover:-rotate-12"
          />
        )}
      </div>
    </button>
  );
}
