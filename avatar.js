(function () {
  const root = document.querySelector("[data-avatar]");
  if (!root) return;

  const svg = root.querySelector(".avatar__svg");
  const pupils = Array.from(root.querySelectorAll(".avatar__pupil"));
  const stickyText = root.querySelector(".avatar__sticky-text");
  const fxScenes = Array.from(root.querySelectorAll(".avatar__fx-scene"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMq = window.matchMedia("(max-width: 980px)");

  let pointer = { x: 0, y: 0 };
  let tracking = false;
  let glanceTimer = null;
  let fxTimer = null;

  function stickyLabel() {
    const lang = document.documentElement.lang || "ru";
    const dict = (window.I18N && window.I18N[lang]) || {};
    return dict.avatar_sticky || (lang === "en" ? "write to me" : "напиши мне");
  }

  function refreshStickyText() {
    if (stickyText) stickyText.textContent = stickyLabel();
  }

  function resetPupils() {
    pupils.forEach((p) => {
      p.style.transform = "translate(0px, 1px)";
    });
  }

  function aimPupils() {
    if (!tracking || mobileMq.matches || reduceMotion || !svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.22;
    const dx = Math.max(-1, Math.min(1, (pointer.x - cx) / (rect.width * 0.5)));
    const dy = Math.max(-1, Math.min(1, (pointer.y - cy) / (rect.height * 0.5)));
    pupils.forEach((p) => {
      p.style.transform = `translate(${dx * 1.5}px, ${dy * 1.2}px)`;
    });
  }

  function nextFx() {
    if (!fxScenes.length || mobileMq.matches) return;
    const cur = fxScenes.findIndex((s) => s.classList.contains("is-active"));
    let next = Math.floor(Math.random() * fxScenes.length);
    if (fxScenes.length > 1 && next === cur) next = (next + 1) % fxScenes.length;
    fxScenes.forEach((s, i) => s.classList.toggle("is-active", i === next));
  }

  function startFx() {
    stopFx();
    if (reduceMotion || mobileMq.matches) return;
    fxTimer = window.setInterval(nextFx, 4500);
  }

  function stopFx() {
    if (fxTimer) window.clearInterval(fxTimer);
    fxTimer = null;
  }

  function startGlanceCycle() {
    if (glanceTimer) window.clearInterval(glanceTimer);
    if (reduceMotion || mobileMq.matches) {
      tracking = false;
      resetPupils();
      return;
    }
    glanceTimer = window.setInterval(() => {
      tracking = true;
      root.classList.add("is-glancing");
      aimPupils();
      window.setTimeout(() => {
        tracking = false;
        root.classList.remove("is-glancing");
        resetPupils();
      }, 2500);
    }, 10000);
  }

  function nod() {
    if (mobileMq.matches || reduceMotion) return;
    root.classList.remove("is-nodding");
    void root.offsetWidth;
    root.classList.add("is-nodding");
    window.setTimeout(() => root.classList.remove("is-nodding"), 900);
  }

  document.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      aimPupils();
    },
    { passive: true }
  );

  mobileMq.addEventListener?.("change", () => {
    startGlanceCycle();
    startFx();
  });

  resetPupils();
  refreshStickyText();
  startGlanceCycle();
  startFx();

  window.avatarNotify = {
    onJobOpen: nod,
    onLang: refreshStickyText,
  };
})();
