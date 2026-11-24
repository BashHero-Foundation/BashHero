import { useSyncExternalStore } from "react";

const THEMES = [
  { label: "Default", value: "" },
  { label: "Lavender", value: "theme-lavender" },
  { label: "Autumn", value: "theme-autumn" },
  { label: "Olive", value: "theme-olive" },
  { label: "Dark", value: "theme-dark" },
];

const THEME_CHANGE_EVENT = "theme-change";

// main listener
function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

function getThemeSnapshot() {
  return localStorage.getItem("theme") ?? "";
}

function getServerThemeSnapshot() {
  return "";
}

export default function ThemeDropdown() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const handleThemeChange = (value: string) => {
    const root = document.documentElement;

    root.classList.remove("theme-lavender", "theme-autumn", "theme-olive", "theme-dark");

    if (value) {
      root.classList.add(value);
      localStorage.setItem("theme", value);
    } else {
      localStorage.removeItem("theme");
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <select
      value={theme}
      onChange={(e) => handleThemeChange(e.target.value)}
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