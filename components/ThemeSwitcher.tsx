import { useEffect, useState } from "react";

const THEMES = [
  { label: "Default", value: "" },
  { label: "Lavender", value: "theme-lavender" },
  { label: "Olive", value: "theme-olive" },
  { label: "Dark", value: "theme-dark" },
];

export default function ThemeDropdown() {
  const [theme, setTheme] = useState("");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("theme-lavender", "theme-olive", "theme-dark");

    if (theme) {
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border rounded px-3 py-2 text-text-neutral"
    >
      {THEMES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}