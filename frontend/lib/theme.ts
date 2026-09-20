export type Theme = "light" | "dark";
const KEY = "neltrix_theme";
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(KEY) as Theme) ?? "light";
}
export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
export function applyStoredTheme() {
  const t = getTheme();
  document.documentElement.setAttribute("data-theme", t);
}