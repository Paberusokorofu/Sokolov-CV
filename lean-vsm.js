(function () {
  const ROOT_SEL = "[data-auto-root]";

  const ARCH_COLORS = ["#64ffda", "#5eead4", "#22d3ee", "#38bdf8", "#e8c47c", "#94a3b8"];

  const ARCHES = [
    { n: 1, short: "lean_arch1", asis: "lean_arch1_m", tobe: "lean_arch1_mt", hAsis: 118, hTobe: 22 },
    { n: 2, short: "lean_arch2", asis: "lean_arch2_m", tobe: "lean_arch2_mt", hAsis: 132, hTobe: 24 },
    { n: 3, short: "lean_arch3", asis: "lean_arch3_m", tobe: "lean_arch3_mt", hAsis: 108, hTobe: 20 },
    { n: 4, short: "lean_arch4", asis: "lean_arch4_m", tobe: "lean_arch4_mt", hAsis: 124, hTobe: 22 },
    { n: 5, short: "lean_arch5", asis: "lean_arch5_m", tobe: "lean_arch5_mt", hAsis: 140, hTobe: 26 },
    { n: 6, short: "lean_arch6", asis: "lean_arch6_m", tobe: "lean_arch6_mt", hAsis: 72, hTobe: 18 },
  ];

  const RUNNER_COUNT = 10;
  const PATH = { W: 920, H: 260, startX: 48, endX: 820, baseY: 188 };
  const ARCH_DWELL_W = [1.0, 3.4, 1.5, 3.0, 3.2, 0.75];
  const ARCH_STATIC_BIAS = [0, 1, 1, 2, 3, 3, 4, 4, 5, 1];

  function rngFor(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (Math.imul(a ^ (a >>> 15), a | 1) + Math.imul(a ^ (a >>> 7), a | 61)) >>> 0;
      return a / 4294967296;
    };
  }

  function archCenters() {
    const gap = (PATH.endX - PATH.startX) / ARCHES.length;
    return ARCHES.map((_, i) => PATH.startX + gap * (i + 0.5));
  }

  function runnerPlan(toBe, index) {
    const rng = rngFor(0xa11ce + index * 97 + (toBe ? 17 : 0));
    const centers = archCenters();
    const pathY = toBe ? PATH.baseY + 6 : PATH.baseY - 2;

    if (prefersReducedMotion()) {
      if (toBe) {
        const phase = 0.58 + (index / Math.max(1, RUNNER_COUNT - 1)) * 0.4;
        return {
          static: true,
          x: PATH.startX + (PATH.endX - PATH.startX) * phase,
          pathY,
        };
      }
      const ai = ARCH_STATIC_BIAS[index % ARCH_STATIC_BIAS.length];
      const jitter = (rng() - 0.5) * 22;
      return { static: true, x: centers[ai] + jitter, pathY };
    }

    const moveUnit = toBe ? 1.05 : 1.15;
    const dwellBase = toBe ? 0.06 : 1.0;
    const segs = [];
    let x = PATH.startX;
    for (let i = 0; i < centers.length; i++) {
      const target = centers[i];
      const travel = (Math.abs(target - x) / ((PATH.endX - PATH.startX) / ARCHES.length)) * moveUnit;
      const dwell =
        dwellBase *
        ARCH_DWELL_W[i] *
        (toBe ? 0.12 + rng() * 0.08 : 0.65 + rng() * 0.9);
      segs.push({ x: target, w: Math.max(0.2, travel), hold: false });
      segs.push({ x: target, w: Math.max(0.02, dwell), hold: true });
      x = target;
    }
    segs.push({
      x: PATH.endX,
      w: moveUnit * (0.85 + rng() * 0.25),
      hold: false,
    });

    const totalW = segs.reduce((s, seg) => s + seg.w, 0);
    const frames = [{ offset: 0, transform: `translateX(${PATH.startX}px)` }];
    let acc = 0;
    for (const seg of segs) {
      if (!seg.hold) {
        acc += seg.w;
        frames.push({ offset: Math.min(1, acc / totalW), transform: `translateX(${seg.x}px)` });
      } else {
        const holdStart = acc / totalW;
        frames.push({ offset: Math.min(1, holdStart), transform: `translateX(${seg.x}px)` });
        acc += seg.w;
        frames.push({ offset: Math.min(1, acc / totalW), transform: `translateX(${seg.x}px)` });
      }
    }
    frames[frames.length - 1].offset = 1;

    const seen = new Set();
    const cleaned = [];
    for (const f of frames) {
      const key = f.offset.toFixed(5);
      if (seen.has(key)) {
        cleaned[cleaned.length - 1] = f;
      } else {
        seen.add(key);
        cleaned.push(f);
      }
    }

    return {
      static: false,
      pathY,
      frames: cleaned,
      duration: toBe ? 5.2 + rng() * 1.6 : 26 + rng() * 16,
      delay: -(index * (toBe ? 0.52 : 2.35) + rng() * (toBe ? 0.35 : 1.4)),
    };
  }

  function dict() {
    const lang = document.documentElement.lang || "ru";
    return (window.I18N && window.I18N[lang]) || (window.I18N && window.I18N.ru) || {};
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  function readTabFromUrl() {
    try {
      const q = new URLSearchParams(location.search).get("tab");
      if (q === "lean" || q === "lean-ai") return "lean";
      if (q === "modern") return "modern";
    } catch (_) {}
    return "modern";
  }

  function writeTabToUrl(tab) {
    try {
      const url = new URL(location.href);
      if (tab === "lean") url.searchParams.set("tab", "lean");
      else url.searchParams.delete("tab");
      if (!url.hash || url.hash === "#") url.hash = "#automation";
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function archRibbon(cx, baseY, halfW, h, thickness) {
    const top = baseY - h;
    const t = thickness;
    const innerTop = top + t;
    return [
      `M ${cx - halfW} ${baseY}`,
      `C ${cx - halfW} ${top}, ${cx + halfW} ${top}, ${cx + halfW} ${baseY}`,
      `L ${cx + halfW - t * 0.55} ${baseY}`,
      `C ${cx + halfW - t * 0.55} ${innerTop}, ${cx - halfW + t * 0.55} ${innerTop}, ${cx - halfW + t * 0.55} ${baseY}`,
      "Z",
    ].join(" ");
  }

  function stickFigure() {
    return [
      '<circle class="lean-runner__head" cx="0" cy="-16" r="3.2"/>',
      '<path class="lean-runner__body" d="M0 -12 L0 -2"/>',
      '<path class="lean-runner__arm" d="M0 -10 L-5 -4 M0 -10 L5 -5"/>',
      '<path class="lean-runner__leg lean-runner__leg--l" d="M0 -2 L-4 8"/>',
      '<path class="lean-runner__leg lean-runner__leg--r" d="M0 -2 L4 8"/>',
    ].join("");
  }

  function bullseye(x, y) {
    return [
      `<g class="lean-funnel__finish" transform="translate(${x} ${y})">`,
      '<line class="lean-funnel__stand" x1="0" y1="0" x2="0" y2="36"/>',
      '<line class="lean-funnel__stand" x1="-10" y1="36" x2="10" y2="36"/>',
      '<line class="lean-funnel__stand" x1="-7" y1="36" x2="-12" y2="48"/>',
      '<line class="lean-funnel__stand" x1="7" y1="36" x2="12" y2="48"/>',
      '<circle class="lean-funnel__target lean-funnel__target--outer" cx="0" cy="0" r="16"/>',
      '<circle class="lean-funnel__target lean-funnel__target--mid" cx="0" cy="0" r="10"/>',
      '<circle class="lean-funnel__target lean-funnel__target--core" cx="0" cy="0" r="4"/>',
      "</g>",
    ].join("");
  }

  function buildMainSvg(toBe) {
    const d = dict();
    const { W, H, startX, endX, baseY: pathY } = PATH;
    const gap = (endX - startX) / ARCHES.length;
    const reduced = prefersReducedMotion();
    const tip = d.lean_request_tip || "инициатива/заявка на согласование";
    const tipEsc = String(tip).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

    const arches = ARCHES.map((a, i) => {
      const cx = startX + gap * (i + 0.5);
      const h = toBe ? a.hTobe : a.hAsis;
      const halfW = toBe ? 28 : 42;
      const color = ARCH_COLORS[i % ARCH_COLORS.length];
      const metric = d[toBe ? a.tobe : a.asis] || "";
      const short = d[a.short] || "";
      const path = archRibbon(cx, pathY, halfW, h, toBe ? 7 : 11);
      return [
        `<g class="lean-arch" data-arch="${a.n}" style="--arch-color:${color}">`,
        `<path class="lean-arch__ribbon" d="${path}" data-arch-path="${a.n}" data-h-now="${h}" data-w-now="${halfW}" data-cx="${cx}" data-base="${pathY}"/>`,
        `<text class="lean-arch__metric" x="${cx}" y="${pathY - h - 8}" text-anchor="middle" data-arch-metric="${a.n}">${metric}</text>`,
        `<text class="lean-arch__label" x="${cx}" y="${pathY + 22}" text-anchor="middle">${short}</text>`,
        "</g>",
      ].join("");
    }).join("");

    const runners = Array.from({ length: RUNNER_COUNT }, (_, i) => {
      const plan = runnerPlan(toBe, i);
      const cls = reduced || plan.static ? "lean-runner is-static" : "lean-runner";
      const style = [
        `--run-x:${plan.x != null ? plan.x : startX}px`,
        `--path-y:${plan.pathY}px`,
      ].join(";");
      return [
        `<g class="${cls}${toBe && !reduced ? " is-fast" : ""}" data-runner="${i}" style="${style}">`,
        `<title>${tipEsc}</title>`,
        '<g class="lean-runner__track">',
        '<g class="lean-runner__bob">',
        stickFigure(),
        "</g></g></g>",
      ].join("");
    }).join("");

    return [
      `<svg class="lean-funnel__svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true" focusable="false">`,
      "<defs>",
      '<linearGradient id="lean-path-grad" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0%" stop-color="rgba(100,255,218,0.08)"/>',
      '<stop offset="100%" stop-color="rgba(148,163,184,0.14)"/>',
      "</linearGradient>",
      '<filter id="lean-arch-glow" x="-40%" y="-40%" width="180%" height="180%">',
      '<feGaussianBlur stdDeviation="2.2" result="b"/>',
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
      "</filter>",
      "</defs>",
      `<rect class="lean-funnel__path" x="${startX - 16}" y="${pathY - 10}" width="${endX - startX + 48}" height="20" rx="10"/>`,
      `<line class="lean-funnel__path-line" x1="${startX - 8}" y1="${pathY}" x2="${endX + 20}" y2="${pathY}"/>`,
      `<g class="lean-funnel__arches">${arches}</g>`,
      `<g class="lean-funnel__runners">${runners}</g>`,
      bullseye(endX + 48, pathY - 28),
      "</svg>",
    ].join("");
  }

  function startRunnerAnims(host, toBe) {
    if (!host) return;
    const reduced = prefersReducedMotion();
    host.querySelectorAll(".lean-runner").forEach((el, i) => {
      const track = el.querySelector(".lean-runner__track");
      if (!track) return;
      track.getAnimations().forEach((a) => a.cancel());
      const plan = runnerPlan(toBe, i);
      el.style.setProperty("--path-y", `${plan.pathY}px`);
      el.classList.toggle("is-fast", !!toBe && !reduced);
      el.classList.toggle("is-static", !!(reduced || plan.static));
      if (plan.static) {
        el.style.setProperty("--run-x", `${plan.x}px`);
        track.style.transform = `translateX(${plan.x}px)`;
        return;
      }
      track.animate(plan.frames, {
        duration: plan.duration * 1000,
        delay: plan.delay * 1000,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      });
    });
  }

  function morphHeights(vsm, toBe) {
    const duration = prefersReducedMotion() ? 0 : 900;
    const d = dict();
    const host = vsm.querySelector('[data-lean-funnel="main"]');
    if (!host) return;
    ARCHES.forEach((a) => {
      const pathEl = host.querySelector(`[data-arch-path="${a.n}"]`);
      const metricEl = host.querySelector(`[data-arch-metric="${a.n}"]`);
      if (!pathEl) return;
      const fromH = parseFloat(pathEl.dataset.hNow || (toBe ? a.hAsis : a.hTobe));
      const toH = toBe ? a.hTobe : a.hAsis;
      const halfFrom = parseFloat(pathEl.dataset.wNow || (toBe ? 42 : 28));
      const halfTo = toBe ? 28 : 42;
      const thickFrom = toBe ? 11 : 7;
      const thickTo = toBe ? 7 : 11;
      const baseY = parseFloat(pathEl.dataset.base || PATH.baseY);
      const cx = parseFloat(
        pathEl.dataset.cx || PATH.startX + ((PATH.endX - PATH.startX) / ARCHES.length) * (a.n - 0.5)
      );
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);

      function frame(now) {
        const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const e = ease(t);
        const h = fromH + (toH - fromH) * e;
        const half = halfFrom + (halfTo - halfFrom) * e;
        const thick = thickFrom + (thickTo - thickFrom) * e;
        pathEl.setAttribute("d", archRibbon(cx, baseY, half, h, thick));
        pathEl.dataset.hNow = String(h);
        pathEl.dataset.wNow = String(half);
        if (metricEl) {
          metricEl.setAttribute("y", String(baseY - h - 8));
          if (t > 0.45) metricEl.textContent = d[toBe ? a.tobe : a.asis] || "";
        }
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  function renderFunnels(vsm, toBe) {
    const main = vsm.querySelector('[data-lean-funnel="main"]');
    if (main) {
      const sr = main.querySelector(".lean-funnel__sr");
      const srHtml = sr ? sr.outerHTML : "";
      main.innerHTML = srHtml + buildMainSvg(toBe);
      startRunnerAnims(main, toBe);
    }
  }

  function setLeanMode(root, mode, { morph = false } = {}) {
    const vsm = root.querySelector("[data-lean-vsm]");
    if (!vsm) return;
    const toBe = mode === "tobe";
    const prev = vsm.dataset.leanMode === "tobe";
    vsm.dataset.leanMode = toBe ? "tobe" : "asis";
    vsm.classList.toggle("is-tobe", toBe);

    const asis = vsm.querySelector('[data-lean-stream="asis"]');
    const tobe = vsm.querySelector('[data-lean-stream="tobe"]');
    if (asis) asis.hidden = toBe;
    if (tobe) tobe.hidden = !toBe;

    const btn = vsm.querySelector("[data-lean-toggle]");
    const d = dict();
    if (btn) {
      const key = toBe ? "lean_cta_asis" : "lean_cta_tobe";
      btn.setAttribute("data-i18n", key);
      btn.textContent = d[key] || (toBe ? "Вернуть As-Is" : "Показать To-Be с AI");
    }

    const doMorph = morph && vsm._funnelReady && prev !== toBe;
    if (!vsm._funnelReady || !doMorph) {
      renderFunnels(vsm, toBe);
      vsm._funnelReady = true;
    } else {
      vsm.classList.add("is-morphing");
      morphHeights(vsm, toBe);
      const main = vsm.querySelector('[data-lean-funnel="main"]');
      startRunnerAnims(main, toBe);
      window.setTimeout(() => vsm.classList.remove("is-morphing"), prefersReducedMotion() ? 0 : 920);
    }

    if (toBe && tobe) {
      tobe.classList.remove("is-enter");
      void tobe.offsetWidth;
      tobe.classList.add("is-enter");
    } else if (!toBe && asis) {
      asis.classList.remove("is-enter");
      void asis.offsetWidth;
      asis.classList.add("is-enter");
    }
  }

  function setTab(root, tab, { syncUrl = true } = {}) {
    const next = tab === "lean" || tab === "lean-ai" ? "lean" : "modern";
    root.dataset.autoActiveTab = next;

    root.querySelectorAll("button[data-auto-tab]").forEach((btn) => {
      const on = btn.getAttribute("data-auto-tab") === next;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    root.querySelectorAll("[data-auto-panel]").forEach((panel) => {
      const on = panel.getAttribute("data-auto-panel") === next;
      panel.hidden = !on;
    });

    const d = dict();
    const titleEl = root.querySelector("[data-auto-title]");
    const leadEl = root.querySelector("[data-auto-lead]");
    const leadLean = root.querySelector("[data-auto-lead-lean]");
    const processEl = root.querySelector("[data-auto-process]");
    if (next === "lean") {
      if (titleEl) {
        titleEl.setAttribute("data-i18n", "lean_title");
        titleEl.textContent = d.lean_title || "Value Stream Mapping";
      }
      if (leadEl) leadEl.hidden = true;
      if (leadLean) leadLean.hidden = false;
      if (processEl) {
        processEl.hidden = false;
        processEl.textContent = d.lean_domain || processEl.textContent;
      }
    } else {
      if (titleEl) {
        titleEl.setAttribute("data-i18n", "auto_title");
        titleEl.textContent = d.auto_title || "Modern AI company";
      }
      if (leadEl) {
        leadEl.hidden = false;
        leadEl.setAttribute("data-i18n", "auto_lead");
        leadEl.textContent = d.auto_lead || "";
      }
      if (leadLean) leadLean.hidden = true;
      if (processEl) processEl.hidden = true;
      requestAnimationFrame(() => {
        root.querySelectorAll("[data-auto-tool], [data-excel-tool]").forEach((el) => {
          el._knzRedraw?.();
        });
      });
    }

    if (syncUrl && location.hash === "#automation") writeTabToUrl(next);
  }

  function bind(root) {
    if (!root || root._leanBound) return;
    root._leanBound = true;

    root.querySelectorAll("button[data-auto-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTab(root, btn.getAttribute("data-auto-tab"));
      });
    });

    const toggle = root.querySelector("[data-lean-toggle]");
    toggle?.addEventListener("click", () => {
      const vsm = root.querySelector("[data-lean-vsm]");
      const cur = vsm?.dataset.leanMode === "tobe" ? "tobe" : "asis";
      setLeanMode(root, cur === "tobe" ? "asis" : "tobe", { morph: true });
    });

    setTab(root, readTabFromUrl(), { syncUrl: false });
    setLeanMode(root, "asis");
  }

  function init() {
    const root = document.querySelector(ROOT_SEL);
    if (root) bind(root);
  }

  function onLang() {
    const root = document.querySelector(ROOT_SEL);
    if (!root) return;
    const tab = root.dataset.autoActiveTab || "modern";
    setTab(root, tab, { syncUrl: false });
    const mode = root.querySelector("[data-lean-vsm]")?.dataset.leanMode || "asis";
    const vsm = root.querySelector("[data-lean-vsm]");
    if (vsm) vsm._funnelReady = false;
    setLeanMode(root, mode);
  }

  window.LeanVSM = { init, setTab, onLang, ARCHES };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const prevApply = window.applyLang;
  if (typeof prevApply === "function") {
    window.applyLang = function (lang, opts) {
      prevApply(lang, opts);
      onLang();
    };
  }
})();
