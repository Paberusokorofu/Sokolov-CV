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
    btn.addEventListener("click", () => applyTheme(btn.getAttribute("data-set-theme")));
  });

  let initial = "light";
  try {
    initial = localStorage.getItem("site-theme") || "light";
  } catch (_) {}
  applyTheme(initial);
  window.applyTheme = applyTheme;
})();
