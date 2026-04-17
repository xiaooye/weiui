(function () {
  try {
    var stored = localStorage.getItem("wui-theme");
    var theme = stored || "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolved;
    if (resolved === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
