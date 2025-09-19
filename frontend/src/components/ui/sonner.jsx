"use client";

import { useState, useEffect } from "react";
import { Toaster as Sonner } from "sonner";

// Custom hook to get/set theme
function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.className = theme; // Applies Tailwind dark/light classes
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

const Toaster = (props) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme} // 'light' or 'dark'
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
};

export { Toaster };
