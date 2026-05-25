/* Apply theme before first paint (include in <head> on every page).
 * Default: Bright Mode (light). Only an explicit saved "dark" or "light" overrides. */
(function () {
  var STORAGE_KEY = "tn-theme";
  var DEFAULT_THEME = "light";

  function resolveTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;
    } catch (e) {
      /* private mode / blocked storage — keep default */
    }
    return DEFAULT_THEME;
  }

  document.documentElement.setAttribute("data-theme", resolveTheme());
})();
