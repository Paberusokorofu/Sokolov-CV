(function () {
  const jobs = Array.from(document.querySelectorAll(".job"));
  const caseList = document.querySelector("[data-case-list]");
  const templates = document.getElementById("case-templates");
  const dialog = document.getElementById("archive-dialog");
  const openArchive = document.querySelector("[data-open-archive]");
  const prevBtn = document.querySelector("[data-job-prev]");
  const nextBtn = document.querySelector("[data-job-next]");
  const navLinks = Array.from(document.querySelectorAll(".aside__nav a"));

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
    });
    if (typeof window.applyLang === "function") {
      window.applyLang(document.documentElement.lang || "ru");
    }
  }

  function selectJob(jobEl, { scrollCases = true } = {}) {
    if (!jobEl) return;
    jobs.forEach((j) => {
      const on = j === jobEl;
      j.classList.toggle("is-active", on);
      j.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderCases(jobEl);
    if (scrollCases && window.matchMedia("(max-width: 980px)").matches) {
      document.getElementById("cases")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function moveJob(delta) {
    const idx = jobs.findIndex((j) => j.classList.contains("is-active"));
    const next = jobs[(idx + delta + jobs.length) % jobs.length];
    selectJob(next);
    next.focus({ preventScroll: true });
  }

  jobs.forEach((job) => {
    job.addEventListener("click", () => selectJob(job));
    job.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectJob(job);
      }
    });
  });

  prevBtn?.addEventListener("click", () => moveJob(-1));
  nextBtn?.addEventListener("click", () => moveJob(1));

  const active = document.querySelector(".job.is-active") || jobs[0];
  selectJob(active, { scrollCases: false });

  openArchive?.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  const sections = ["about", "experience", "cases", "education", "contact"]
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
})();
