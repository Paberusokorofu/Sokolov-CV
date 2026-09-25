(function () {
  const root = document.querySelector("[data-avatar]");
  if (!root) return;

  const SIGH_EVERY = 10000;
  const SIGH_DURATION = 1200;
  const SIP_EVERY = 20000;
  const SIP_DURATION = 4200;
  const CHEER_EVERY = 30000;
  const CHEER_DURATION = 1800;
  // confetti / salute keep falling a little past the end of the pose
  const CHEER_FX_DURATION = 2700;
  const FX_EVERY = 4500;
  const NOD_DURATION = 900;
  const NOTE_FLY_DURATION = 1600;

  const svg = root.querySelector(".avatar__svg");
  const stage = root.querySelector(".avatar__stage") || root;
  // Bare-eye pupils only: lens pupils stay put under the dashboard FX.
  const pupils = Array.from(root.querySelectorAll(".avatar__eyes-bare .avatar__pupil"));
  const stickyTexts = Array.from(root.querySelectorAll(".avatar__sticky-text"));
  const fxScenes = Array.from(root.querySelectorAll(".avatar__fx-scene"));
  const fxKeys = fxScenes
    .map((scene) => scene.dataset.fx)
    .filter((key, i, all) => all.indexOf(key) === i);
  const fingers = [];
  const keys = [];
  root.querySelectorAll(".avatar__finger").forEach((node) => {
    fingers[Number(node.dataset.finger)] = node;
  });
  root.querySelectorAll(".avatar__key").forEach((node) => {
    keys[Number(node.dataset.key)] = node;
  });

  // Lab typing is locked to T2 «Офисный». Extra mood tables stay for GIF previews.
  const TYPING = {
    T1: {
      label: "T1 «Спокойный»",
      press: 220,
      beat: 210,
      gap: [640, 1080],
      phrases: ["single", "single", "single", "single", "single", "pair", "runR3"],
    },
    T2: {
      label: "T2 «Офисный»",
      press: 150,
      beat: 125,
      gap: [260, 520],
      phrases: ["single", "single", "single", "pair", "pair", "triple", "runR3", "runL3"],
    },
    T3: {
      label: "T3 «Быстрый набор»",
      press: 95,
      beat: 70,
      gap: [80, 190],
      phrases: ["single", "single", "pair", "pair", "triple", "runR4", "runL4", "sweepR", "sweepL"],
    },
    T4: {
      label: "T4 «Ритмичный»",
      press: 130,
      beat: 95,
      gap: [240, 340],
      script: ["sweepR", "sweepL", "single", "single", "pair", "single"],
    },
  };
  const TYPING_LOCKED = "T2";
  // Eye white 28×18, pupil 12×18 → ±8x / ±3y in viewBox units (pixel steps).
  const PUPIL_MAX_X = 8;
  const PUPIL_MAX_Y = 3;

  const hits = {
    lamp: root.querySelector('[data-lab-hit="lamp"]'),
    glasses: root.querySelector('[data-lab-hit="glasses"]'),
    glassesSill: root.querySelector('[data-lab-hit="glassesSill"]'),
    drink: root.querySelector('[data-lab-hit="drink"]'),
    notepad: root.querySelector('[data-lab-hit="notepad"]'),
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The lab page always behaves like desktop: no mobile opt-out.
  const isLab = root.hasAttribute("data-avatar-lab");
  const mobileMq = window.matchMedia("(max-width: 980px)");

  const HIT_FLASH = 600;
  // long enough to cover the cheer pose plus the confetti / salute tail
  const QR_ZOOM_DURATION = 4200;

  let pointer = { x: 0, y: 0 };
  let busy = false;
  let noteGone = false;
  let casesCheered = false;
  let glassesOff = false;
  let wine = false;
  let qrTimer = 0;
  let typingVariant = TYPING_LOCKED;
  let typingStep = 0;
  let typingTimers = [];
  let timers = [];
  const stickyEl = root.querySelector(".avatar__sticky");
  const contactTriggers = [
    document.getElementById("contact"),
    document.getElementById("contacts"),
    ...document.querySelectorAll('[data-nav="contact"]'),
  ].filter((el, i, all) => el && all.indexOf(el) === i);

  function isPaused() {
    return reduceMotion || (!isLab && mobileMq.matches);
  }

  function refreshStickyText() {
    stickyTexts.forEach((node) => {
      node.textContent = "call me";
    });
  }

  function resetPupils() {
    pupils.forEach((p) => {
      p.style.transform = "translate(0px, 0px)";
    });
  }

  function aimPupils() {
    // Cursor tracking only with glasses on the sill; otherwise stay neutral.
    if (!glassesOff || isPaused() || !svg || !pupils.length) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const vbW = vb && vb.width ? vb.width : 384;
    const vbH = vb && vb.height ? vb.height : 448;
    if (!rect.width || !rect.height) return;
    const sx = rect.width / vbW;
    const sy = rect.height / vbH;
    // Aim from the face/eye band, not the desk center.
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * (168 / vbH);
    const nx = Math.max(-1, Math.min(1, (pointer.x - cx) / (rect.width * 0.45)));
    const ny = Math.max(-1, Math.min(1, (pointer.y - cy) / (rect.height * 0.35)));
    const ox = Math.round(nx * PUPIL_MAX_X);
    const oy = Math.round(ny * PUPIL_MAX_Y);
    pupils.forEach((p) => {
      p.style.transform = `translate(${ox * sx}px, ${oy * sy}px)`;
    });
  }

  function play(className, duration, done) {
    root.classList.remove(className);
    void root.offsetWidth;
    root.classList.add(className);
    window.setTimeout(() => {
      root.classList.remove(className);
      if (done) done();
    }, duration);
  }

  function sigh() {
    if (isPaused() || busy) return;
    busy = true;
    play("is-sighing", SIGH_DURATION, () => {
      busy = false;
    });
  }

  function sip() {
    if (isPaused()) return;
    if (busy) {
      window.setTimeout(sip, 600);
      return;
    }
    busy = true;
    play("is-sipping", SIP_DURATION, () => {
      busy = false;
    });
  }

  function cheer() {
    if (isPaused()) return;
    if (busy) {
      window.setTimeout(cheer, 600);
      return;
    }
    busy = true;
    root.classList.remove("is-cheer-fx");
    void root.offsetWidth;
    root.classList.add("is-cheer-fx");
    window.setTimeout(() => root.classList.remove("is-cheer-fx"), CHEER_FX_DURATION);
    play("is-cheering", CHEER_DURATION, () => {
      busy = false;
    });
  }

  function nod() {
    if (isPaused()) return;
    play("is-nodding", NOD_DURATION);
  }

  function noteFly() {
    if (noteGone) return;
    noteGone = true;
    if (isPaused()) {
      root.classList.add("is-note-gone");
      root.classList.remove("is-note-flying");
      return;
    }
    root.classList.add("is-note-flying");
    window.setTimeout(() => {
      root.classList.add("is-note-gone");
      root.classList.remove("is-note-flying");
    }, NOTE_FLY_DURATION);
  }

  function noteReset() {
    noteGone = false;
    root.classList.remove("is-note-flying", "is-note-gone");
  }

  function noteShow() {
    noteReset();
  }

  function onCasesOpen() {
    if (casesCheered) return;
    casesCheered = true;
    cheer();
  }

  // ---- typing: individual fingers, changing patterns --------------------

  function randInt(n) {
    return Math.floor(Math.random() * n);
  }

  function randBetween(range) {
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  // one phrase = a list of { finger, at } presses relative to the phrase start
  function buildPhrase(kind, beat) {
    const out = [];
    const count = fingers.length;
    if (!count) return out;

    if (kind === "single") {
      out.push({ finger: randInt(count), at: 0 });
    } else if (kind === "pair" || kind === "triple") {
      const want = kind === "pair" ? 2 : 3;
      const pool = [];
      while (pool.length < want) {
        const i = randInt(count);
        if (pool.indexOf(i) === -1) pool.push(i);
      }
      pool.forEach((i, n) => out.push({ finger: i, at: n * beat }));
    } else if (kind === "sweepR" || kind === "sweepL") {
      for (let n = 0; n < count; n += 1) {
        out.push({ finger: kind === "sweepR" ? n : count - 1 - n, at: n * beat });
      }
    } else if (kind.indexOf("runR") === 0 || kind.indexOf("runL") === 0) {
      const len = Math.min(Number(kind.slice(4)) || 3, count);
      const start = randInt(count - len + 1);
      for (let n = 0; n < len; n += 1) {
        const i = kind.indexOf("runR") === 0 ? start + n : start + len - 1 - n;
        out.push({ finger: i, at: n * beat });
      }
    }
    return out;
  }

  function pressFinger(index, hold) {
    const finger = fingers[index];
    if (!finger) return;
    // the left hand is busy with the mug, and both hands are up on a cheer
    if (root.classList.contains("is-cheering")) return;
    if (root.classList.contains("is-sipping") && index < 4) return;

    const key = keys[index];
    finger.classList.add("is-down");
    if (key) key.classList.add("is-hit");
    const id = window.setTimeout(() => {
      finger.classList.remove("is-down");
      if (key) key.classList.remove("is-hit");
    }, hold);
    typingTimers.push(id);
  }

  function stopTyping() {
    typingTimers.forEach((id) => window.clearTimeout(id));
    typingTimers = [];
    fingers.forEach((f) => f && f.classList.remove("is-down"));
    keys.forEach((k) => k && k.classList.remove("is-hit"));
  }

  function typingTick() {
    if (isPaused()) return;
    const variant = TYPING[typingVariant] || TYPING.T2;
    const kind = variant.script
      ? variant.script[typingStep++ % variant.script.length]
      : variant.phrases[randInt(variant.phrases.length)];

    const phrase = buildPhrase(kind, variant.beat);
    let last = 0;
    phrase.forEach((step) => {
      if (step.at > last) last = step.at;
      const id = window.setTimeout(() => pressFinger(step.finger, variant.press), step.at);
      typingTimers.push(id);
    });

    const next = last + variant.press + randBetween(variant.gap);
    typingTimers.push(window.setTimeout(typingTick, next));
  }

  function startTyping() {
    stopTyping();
    if (isPaused() || !fingers.length) return;
    typingTimers.push(window.setTimeout(typingTick, 300));
  }

  function setTyping() {
    typingVariant = TYPING_LOCKED;
    typingStep = 0;
    startTyping();
    return typingVariant;
  }

  // ---- clickable props -------------------------------------------------

  function flashHit(node) {
    if (!node) return;
    node.classList.remove("is-hit-flash");
    // SVG elements have no offsetWidth; force the reflow through layout instead
    void node.getBoundingClientRect();
    node.classList.add("is-hit-flash");
    window.setTimeout(() => node.classList.remove("is-hit-flash"), HIT_FLASH);
  }

  // the lamp shade is the light switch: light ↔ dark
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    if (typeof window.applyTheme === "function") window.applyTheme(next);
    else document.documentElement.setAttribute("data-theme", next);
    return next;
  }

  function setGlasses(off) {
    glassesOff = !!off;
    root.classList.toggle("is-glasses-off", glassesOff);
    if (glassesOff) aimPupils();
    else resetPupils();
    // drop / restore the lens dashboard cycle along with the frames
    startCycles();
  }

  function toggleGlasses() {
    setGlasses(!glassesOff);
  }

  // the vessel slot holds either the mug or the wine glass; swapping to wine
  // is a victory, swapping back to coffee is a sigh
  function setDrink(kind, withEmotion) {
    wine = kind === "wine";
    root.classList.toggle("is-wine", wine);
    if (withEmotion) {
      if (wine) cheer();
      else sigh();
    }
    return wine ? "wine" : "coffee";
  }

  function toggleDrink() {
    return setDrink(wine ? "coffee" : "wine", true);
  }

  // the notepad is the "let's talk" prop: scroll down to the Telegram QR,
  // blow it up to 2× and celebrate while it is on screen
  function notepad() {
    const qr = document.querySelector("[data-avatar-qr]") || document.querySelector(".qr");
    if (qr) {
      qr.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      qr.classList.add("is-zoomed");
      window.clearTimeout(qrTimer);
      qrTimer = window.setTimeout(() => qr.classList.remove("is-zoomed"), QR_ZOOM_DURATION);
    }
    cheer();
  }

  function showFx(key) {
    fxScenes.forEach((scene) => {
      scene.classList.toggle("is-active", scene.dataset.fx === key);
    });
  }

  function nextFx() {
    if (glassesOff || fxKeys.length < 2) return;
    const current = fxScenes.find((scene) => scene.classList.contains("is-active"));
    const currentKey = current ? current.dataset.fx : null;
    let next = Math.floor(Math.random() * fxKeys.length);
    if (fxKeys[next] === currentKey) next = (next + 1) % fxKeys.length;
    showFx(fxKeys[next]);
  }

  function stopCycles() {
    timers.forEach((t) => {
      window.clearTimeout(t.id);
      window.clearInterval(t.id);
    });
    timers = [];
  }

  // staggered start so sigh / sip / cheer rarely land on the same tick
  function cycle(fn, every, offset) {
    const token = { id: 0 };
    timers.push(token);
    token.id = window.setTimeout(() => {
      fn();
      token.id = window.setInterval(fn, every);
    }, offset);
  }

  function startCycles() {
    stopCycles();
    if (isPaused()) {
      resetPupils();
      stopTyping();
      return;
    }
    // already running: leave the rhythm alone instead of restarting it
    if (!typingTimers.length) startTyping();
    cycle(sigh, SIGH_EVERY, SIGH_EVERY);
    cycle(sip, SIP_EVERY, SIP_EVERY + 3000);
    cycle(cheer, CHEER_EVERY, CHEER_EVERY + 7000);
    if (!glassesOff) cycle(nextFx, FX_EVERY, FX_EVERY);
    else aimPupils();
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

  if (hits.lamp) {
    hits.lamp.addEventListener("click", () => {
      flashHit(hits.lamp);
      toggleTheme();
    });
  }

  if (hits.glasses) {
    hits.glasses.addEventListener("click", () => {
      flashHit(hits.glasses);
      setGlasses(true);
    });
  }

  if (hits.glassesSill) {
    hits.glassesSill.addEventListener("click", () => {
      flashHit(hits.glassesSill);
      setGlasses(false);
    });
  }

  if (hits.drink) {
    hits.drink.addEventListener("click", () => {
      flashHit(hits.drink);
      toggleDrink();
    });
  }

  if (hits.notepad) {
    hits.notepad.addEventListener("click", () => {
      flashHit(hits.notepad);
      notepad();
    });
  }

  if (isLab) {
    stage.addEventListener("pointerenter", noteFly, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) noteFly();
    });
  } else {
    noteGone = true;
    root.classList.add("is-note-gone");
    contactTriggers.forEach((el) => {
      el.addEventListener("pointerenter", noteShow);
      el.addEventListener("mouseenter", noteShow);
    });
    stickyEl?.addEventListener("click", (e) => {
      e.stopPropagation();
      noteFly();
    });
  }

  if (!isLab) {
    mobileMq.addEventListener?.("change", startCycles);
  }

  resetPupils();
  refreshStickyText();
  startCycles();

  // Lab-only screenshot hook: ?verifyEyes=1 → glasses off, pupils look up-right.
  if (isLab && /(?:\?|&)verifyEyes=1(?:&|$)/.test(location.search) && svg) {
    window.setTimeout(() => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      pointer.x = rect.right - 8;
      pointer.y = rect.top + 12;
      setGlasses(true);
      aimPupils();
    }, 600);
  }

  window.avatarNotify = {
    onJobOpen: nod,
    onCasesOpen,
    onLang: refreshStickyText,
    onVisitorLook: noteFly,
    showSticky: noteShow,
    peelSticky: noteFly,
  };

  if (isLab) {
    window.avatarLab = {
      sigh,
      sip,
      cheer,
      nod,
      noteFly,
      noteReset,
      toggleTheme,
      toggleGlasses,
      toggleDrink,
      notepad,
      setTyping,
      typingVariants: Object.keys(TYPING).map((key) => ({ key, label: TYPING[key].label })),
    };
  }
})();
