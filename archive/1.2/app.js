(function () {
  const jobs = Array.from(document.querySelectorAll(".job"));
  const linked = document.getElementById("job-linked");
  const caseList = document.querySelector("[data-case-list]");
  const photosEl = document.querySelector("[data-job-photos]");
  const templates = document.getElementById("case-templates");
  const dialog = document.getElementById("archive-dialog");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox?.querySelector(".lightbox__img");
  const openArchive = document.querySelector("[data-open-archive]");
  const prevBtn = document.querySelector("[data-job-prev]");
  const nextBtn = document.querySelector("[data-job-next]");
  const navLinks = Array.from(document.querySelectorAll(".aside__nav a"));
  const yearScale = document.querySelector("[data-year-scale]");
  let yearBtns = [];

  function buildYearScale() {
    if (!yearScale) return;
    yearScale.innerHTML = "";
    for (let y = 2007; y <= 2026; y += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "timeline__year";
      btn.setAttribute("data-year", String(y));
      btn.textContent = String(y);
      btn.addEventListener("click", () => {
        const job = jobForYear(y);
        if (job) selectJob(job, { focus: true, openLinked: true, year: y });
      });
      yearScale.appendChild(btn);
    }
    yearBtns = Array.from(yearScale.querySelectorAll("[data-year]"));
  }
  const jobTitleEl = document.querySelector("[data-job-title]");
  const jobDetailEl = document.querySelector("[data-job-detail]");
  const homeLinks = Array.from(document.querySelectorAll("[data-home]"));
  const jobsRoot = document.querySelector(".jobs");

  jobs.forEach((job) => {
    if (job.querySelector(":scope > .job__main")) return;
    const main = document.createElement("div");
    main.className = "job__main";
    Array.from(job.childNodes).forEach((node) => {
      if (node.nodeType === 1 && node.id === "job-linked") return;
      main.appendChild(node);
    });
    job.insertBefore(main, job.firstChild);
  });

  function dict() {
    const lang = document.documentElement.lang || "ru";
    return (window.I18N && window.I18N[lang]) || {};
  }

  function fillPhotos(jobEl) {
    if (!photosEl || !jobEl) return;
    const sources = (jobEl.getAttribute("data-photos") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    photosEl.innerHTML = "";
    if (!sources.length) {
      photosEl.hidden = true;
      return;
    }
    photosEl.hidden = false;
    sources.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "job-linked__thumb";
      btn.setAttribute("aria-label", `Photo ${i + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(src);
      });
      photosEl.appendChild(btn);
    });
  }

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
  }

  function bindCaseMedia(root) {
    if (!root) return;
    root.querySelectorAll("[data-lightbox]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const src = btn.getAttribute("data-lightbox");
        if (src) openLightbox(src);
      });
    });
  }

  function fillStory(jobEl) {
    if (!jobEl) return;
    const title = jobEl.querySelector(".job__main h3")?.textContent?.trim() || "";
    const key = jobEl.getAttribute("data-detail") || "";
    const d = dict();
    if (jobTitleEl) jobTitleEl.textContent = title;
    if (jobDetailEl) jobDetailEl.textContent = d[key] || "";
    fillPhotos(jobEl);
  }

  function renderCases(jobEl) {
    if (!caseList || !templates || !jobEl) return;
    const ids = (jobEl.getAttribute("data-cases") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    caseList.innerHTML = "";
    ids.forEach((id, i) => {
      const src = templates.content.querySelector(`[data-case="${id}"]`);
      if (!src) return;
      const node = src.cloneNode(true);
      node.style.animationDelay = `${i * 60}ms`;
      caseList.appendChild(node);
      bindCaseMedia(node);
    });
    if (typeof window.applyLang === "function") {
      window.applyLang(document.documentElement.lang || "ru");
    }
    fillStory(jobEl);
  }

  function attachLinked(jobEl, { open = true } = {}) {
    if (!linked) return;
    if (!jobEl) {
      if (jobsRoot) jobsRoot.appendChild(linked);
      linked.hidden = true;
      linked.classList.remove("is-open");
      return;
    }
    jobEl.appendChild(linked);
    linked.hidden = !open;
    linked.classList.toggle("is-open", open);
  }

  function collapseHome({ scroll = true } = {}) {
    document.body.classList.remove("is-job-focus");
    jobs.forEach((j) => {
      j.classList.remove("is-active");
      j.setAttribute("aria-selected", "false");
    });
    yearBtns.forEach((b) => b.classList.remove("is-active"));
    attachLinked(null);
    if (scroll) {
      document.getElementById("intro")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function selectJob(jobEl, { scrollTo = true, focus = true, openLinked = true, year = null } = {}) {
    if (!jobEl) return;
    jobs.forEach((j) => {
      const on = j === jobEl;
      j.classList.toggle("is-active", on);
      j.setAttribute("aria-selected", on ? "true" : "false");
    });
    yearBtns.forEach((b) => {
      const y = Number(b.getAttribute("data-year"));
      const from = Number(jobEl.getAttribute("data-from"));
      const to = Number(jobEl.getAttribute("data-to"));
      b.classList.toggle("is-active", year != null ? y === year : y >= from && y <= to);
    });
    if (focus) document.body.classList.add("is-job-focus");
    attachLinked(jobEl, { open: openLinked || focus });
    renderCases(jobEl);
    if (scrollTo && (focus || openLinked)) {
      requestAnimationFrame(() => {
        jobEl.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  function jobForYear(year) {
    const matches = jobs.filter((j) => {
      const from = Number(j.getAttribute("data-from"));
      const to = Number(j.getAttribute("data-to"));
      return year >= from && year <= to;
    });
    if (!matches.length) return null;
    return matches.sort((a, b) => Number(b.getAttribute("data-from")) - Number(a.getAttribute("data-from")))[0];
  }

  function moveJob(delta) {
    const idx = Math.max(0, jobs.findIndex((j) => j.classList.contains("is-active")));
    const next = jobs[(idx + delta + jobs.length) % jobs.length];
    selectJob(next, { focus: true, openLinked: true });
    next.focus({ preventScroll: true });
  }

  jobs.forEach((job) => {
    job.addEventListener("click", (e) => {
      if (e.target.closest(".job-linked")) return;
      selectJob(job, { focus: true, openLinked: true });
    });
    job.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest(".job-linked")) return;
        e.preventDefault();
        selectJob(job, { focus: true, openLinked: true });
      }
    });
  });

  buildYearScale();

  homeLinks.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      collapseHome({ scroll: true });
    });
  });

  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      if (a.getAttribute("data-nav") === "intro") collapseHome({ scroll: false });
    });
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    moveJob(-1);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    moveJob(1);
  });

  collapseHome({ scroll: false });

  openArchive?.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close?.();
  });

  const sections = ["intro", "cases", "education", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("data-nav") === id);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );
  sections.forEach((s) => spy.observe(s));

  window.refreshJobStory = function () {
    const job = document.querySelector(".job.is-active");
    if (job) fillStory(job);
  };
})();
