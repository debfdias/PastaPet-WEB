"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeButtons = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !theme) {
      const systemTheme =
        resolvedTheme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");

      setTheme(systemTheme);
    }
  }, [mounted, theme, resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
        <Sun className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </button>
    );
  }

  const effectiveTheme = resolvedTheme || theme;

  return (
    <button
      onClick={() => setTheme(effectiveTheme === "dark" ? "light" : "dark")}
      className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {effectiveTheme === "dark" ? (
        <Sun className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
};
