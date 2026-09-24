(function () {
  const root = document.querySelector("[data-avatar]");
  if (!root) return;

  const svg = root.querySelector(".avatar__svg");
  const pupils = Array.from(root.querySelectorAll(".avatar__pupil"));
  const scenes = Array.from(root.querySelectorAll(".avatar__scene"));
  const stickyText = root.querySelector(".avatar__sticky-text");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMq = window.matchMedia("(max-width: 980px)");

  let sceneTimer = null;
  let trackTimer = null;
  let stickyTimer = null;
  let tracking = true;
  let stickyShown = false;

  function stickyLabel() {
    const lang = document.documentElement.lang || "ru";
    const dict = (window.I18N && window.I18N[lang]) || {};
    return dict.avatar_sticky || (lang === "en" ? "write to me" : "напиши мне");
  }

  function refreshStickyText() {
    if (stickyText) stickyText.textContent = stickyLabel();
  }

  function setScene(index) {
    scenes.forEach((s, i) => s.classList.toggle("is-active", i === index));
  }

  function nextScene() {
    if (!scenes.length || mobileMq.matches) return;
    const current = scenes.findIndex((s) => s.classList.contains("is-active"));
    let next = Math.floor(Math.random() * scenes.length);
    if (scenes.length > 1 && next === current) next = (next + 1) % scenes.length;
    setScene(next);
  }

  function startScenes() {
    stopScenes();
    if (reduceMotion || mobileMq.matches) return;
    sceneTimer = window.setInterval(nextScene, 4200);
  }

  function stopScenes() {
    if (sceneTimer) window.clearInterval(sceneTimer);
    sceneTimer = null;
  }

  function onPointerMove(e) {
    if (!tracking || mobileMq.matches || reduceMotion) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.28;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 0.55)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.55)));
    pupils.forEach((p) => {
      p.style.transform = `translate(${dx * 3.2}px, ${dy * 2.6}px)`;
    });
  }

  function pulseTracking() {
    tracking = true;
    if (trackTimer) window.clearTimeout(trackTimer);
    trackTimer = window.setTimeout(() => {
      tracking = Math.random() > 0.35;
      if (!tracking) {
        pupils.forEach((p) => {
          p.style.transform = "translate(0, 0)";
        });
        window.setTimeout(() => {
          tracking = true;
        }, 1600 + Math.random() * 1200);
      }
    }, 2800 + Math.random() * 2200);
  }

  function nod() {
    if (mobileMq.matches || reduceMotion) return;
    root.classList.remove("is-nodding");
    void root.offsetWidth;
    root.classList.add("is-nodding");
    window.setTimeout(() => root.classList.remove("is-nodding"), 900);
  }

  function showSticky() {
    if (mobileMq.matches || stickyShown) return;
    stickyShown = true;
    refreshStickyText();
    root.classList.add("is-sticky");
    if (stickyTimer) window.clearTimeout(stickyTimer);
    stickyTimer = window.setTimeout(() => {
      root.classList.remove("is-sticky");
      stickyShown = false;
    }, 5000);
  }

  function onScrollEnd(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) showSticky();
    });
  }

  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointermove", pulseTracking, { passive: true });

  const contact = document.getElementById("contact");
  const footer = document.querySelector(".footer");
  const endSpy = new IntersectionObserver(onScrollEnd, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.35,
  });
  if (contact) endSpy.observe(contact);
  if (footer) endSpy.observe(footer);

  mobileMq.addEventListener?.("change", () => {
    if (mobileMq.matches) {
      stopScenes();
      root.classList.remove("is-sticky", "is-nodding");
    } else {
      startScenes();
    }
  });

  startScenes();
  refreshStickyText();

  window.avatarNotify = {
    onJobOpen: nod,
    onLang: refreshStickyText,
  };
})();
