(function () {
  const buttons = Array.from(document.querySelectorAll("[data-set-theme]"));
  if (!buttons.length) return;

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("site-theme", next);
    } catch (_) {}
    buttons.forEach((btn) => {
      const on = btn.getAttribute("data-set-theme") === next;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-set-theme");
      if (target === "light" || target === "dark") applyTheme(target);
    });
  });

  applyTheme("dark");
  window.applyTheme = applyTheme;
})();
