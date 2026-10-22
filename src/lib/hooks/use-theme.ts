import { useEffect } from "react";
import { settingsStore, type SettingsState } from "@/lib/providers/settings-provider";

export function resolveTheme(theme: SettingsState["theme"]): "light" | "dark" {
  if (theme === "dark" || theme === "light") {
    return theme;
  }
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function applyDocumentTheme(theme: SettingsState["theme"]): "light" | "dark" {
  const resolved = resolveTheme(theme);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  }
  return resolved;
}

export function useTheme() {
  const [settings, setSettings] = settingsStore.useStore();
  const theme = settings.theme;
  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    applyDocumentTheme(theme);

    if (
      theme !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyDocumentTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme: (t: "dark" | "light" | "system") => setSettings((s) => ({ ...s, theme: t })),
    toggle: () =>
      setSettings((s) => ({
        ...s,
        theme: resolveTheme(s.theme) === "dark" ? "light" : "dark",
      })),
  };
}
