const THEME_STORAGE_KEY = "tn-theme";
/** Bright Mode — used on first visit and when no valid preference is stored */
const THEME_DEFAULT = "light";

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return THEME_DEFAULT;
}

function applyTheme(theme, { persist = true } = {}) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  if (persist) localStorage.setItem(THEME_STORAGE_KEY, next);
  syncThemeToggle(next);
}

function syncThemeToggle(theme) {
  const isDark = theme === "dark";
  const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";

  document.querySelectorAll(".theme-toggle").forEach((toggle) => {
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", label);
    toggle.classList.toggle("theme-toggle--dark", isDark);
  });
}

function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") || THEME_DEFAULT;
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.classList.add("theme-transition");
  applyTheme(next);
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 400);
}

function initTheme() {
  applyTheme(getPreferredTheme(), { persist: false });

  document.querySelectorAll(".theme-toggle").forEach((toggle) => {
    if (toggle.dataset.themeBound === "true") return;
    toggle.dataset.themeBound = "true";
    toggle.addEventListener("click", toggleTheme);
  });
}
