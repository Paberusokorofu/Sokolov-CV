const I18N = {
  ru: {
    nav_cases: "Кейсы",
    nav_approach: "Подход",
    nav_stack: "Стек",
    nav_courses: "Курсы",
    nav_contact: "Контакты",
    city: "Москва",
    role: "IT Project Manager / руководитель IT-проектов",
    lead: "Портфолио delivery: 0-цикл, параллельный портфель, Lean/BPMN и прикладные ML/RAG-инициативы. Линейно — команда аналитиков; разработку и QA координирую на уровне проекта.",
    cta_cases: "Смотреть кейсы",
    cta_pdf: "Скачать PDF",
    cases_title: "Кейсы",
    cases_intro: "АО «НБИ» · руководитель IT-проектов · 08.2022 — 08.2026",
    tag_delivery: "Delivery",
    tag_process: "Процессы",
    tag_ml: "ML / LLM",
    case1_title: "0-цикл и портфель",
    case1_body: "Закрыл 2 проекта с нуля (0-цикл) до подписания актов. Портфель — 4 проекта параллельно (3,5–60 тыс. чел.-ч., бюджеты до 1 млрд руб.). Полный цикл: ТЗ, команда, реализация, приёмка, релиз, закрывающие акты. Линейное руководство командой аналитиков; разработку и QA координировал на уровне проекта (сроки, зависимости, релизы) — без линейного подчинения.",
    case2_title: "BPMN и Lean: −18% времени на доставку",
    case2_body: "Автоматизация доставки по BPMN (Jira, Confluence, Redmine) — −18% фактического времени (Lean). Релизный контур нескольких команд: план итераций, окна релизов, контроль этапов; гибрид Agile / Scrum / Kanban и Waterfall (DoR/DoD, daily, демо, ретро, метрики потока). Календарное планирование в MS Project.",
    case3_title: "RAG / LLM и прогноз электропотребления",
    case3_body: "RAG / LLM на базе знаний 10 ГБ. ML-прогноз электропотребления (Python, точность 78% за год).",
    approach_title: "Подход",
    approach_body: "Delivery полного цикла. Стейкхолдеры и риски: бэклог и зависимости с Product Manager и Tech Lead; эскалация блокеров (критичная информация за 1 неделю вместо 3 месяцев); переговоры с ЛПР и заказчиками. Домены: госсектор, 44-ФЗ, банк, нефтегаз, энергетика. Английский B2. PMP (PMI) — в процессе.",
    stack_title: "Стек",
    tag_bitrix: "Битрикс24",
    tag_1c: "1С",
    courses_title: "Курсы",
    course_pmp: "Project Management Professional (PMP), PMI — в процессе",
    course_ss: "Six Sigma Green Belt, Simplilearn (Lean management)",
    course_ml: "Google Machine Learning Crash Course —",
    course_badges: "badges на g.dev",
    course_android: "Android Studio User, Google",
    contact_title: "Контакты",
    pdf_hint: "PDF: положите CV Sokolov Pavel.pdf рядом с index.html при деплое.",
  },
  en: {
    nav_cases: "Cases",
    nav_approach: "Approach",
    nav_stack: "Stack",
    nav_courses: "Courses",
    nav_contact: "Contact",
    city: "Moscow",
    role: "IT Project Manager",
    lead: "Delivery portfolio: zero-cycle launches, parallel project portfolio, Lean/BPMN, and applied ML/RAG initiatives. Line management of the analytics team only; development and QA coordinated at project level.",
    cta_cases: "View cases",
    cta_pdf: "Download PDF",
    cases_title: "Cases",
    cases_intro: "NBI JSC · IT Project Manager · 08.2022 — 08.2026",
    tag_delivery: "Delivery",
    tag_process: "Process",
    tag_ml: "ML / LLM",
    case1_title: "Zero-cycle delivery and portfolio",
    case1_body: "Closed 2 projects from scratch (zero-cycle) through signed acceptance acts. Portfolio: 4 projects in parallel (3.5–60k person-hours, budgets up to RUB 1bn). Full cycle: requirements, team, delivery, acceptance, release, closing documents. Line management of the analytics team; development and QA coordinated at project level (schedule, dependencies, releases) — not as direct reports.",
    case2_title: "BPMN and Lean: −18% delivery time",
    case2_body: "Delivery automation with BPMN (Jira, Confluence, Redmine) — −18% actual time (Lean). Multi-team release cadence: iteration plans, release windows, stage control; hybrid Agile / Scrum / Kanban and Waterfall (DoR/DoD, daily, demo, retro, flow metrics). Schedule and resource planning in MS Project.",
    case3_title: "RAG / LLM and electricity-consumption forecast",
    case3_body: "RAG / LLM on a 10 GB knowledge base. ML forecast of electricity consumption (Python, 78% accuracy over a year).",
    approach_title: "Approach",
    approach_body: "End-to-end delivery. Stakeholders and risk: backlog and dependencies with Product Manager and Tech Lead; blocker escalation (critical information in 1 week instead of 3 months); negotiations with decision-makers and customers. Domains: public sector, Federal Law 44-FZ, banking, oil & gas, energy. English B2. PMP (PMI) — in progress.",
    stack_title: "Stack",
    tag_bitrix: "Bitrix24",
    tag_1c: "1C",
    courses_title: "Courses",
    course_pmp: "Project Management Professional (PMP), PMI — in progress",
    course_ss: "Six Sigma Green Belt, Simplilearn (Lean management)",
    course_ml: "Google Machine Learning Crash Course —",
    course_badges: "badges on g.dev",
    course_android: "Android Studio User, Google",
    contact_title: "Contact",
    pdf_hint: "PDF: place CV Sokolov Pavel.pdf next to index.html when deploying.",
  },
};

function applyLang(lang) {
  const dict = I18N[lang] || I18N.ru;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    const active = btn.getAttribute("data-set-lang") === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  try {
    localStorage.setItem("site-lang", lang);
  } catch (_) {}
}

document.querySelectorAll("[data-set-lang]").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.getAttribute("data-set-lang")));
});

let start = "ru";
try {
  const saved = localStorage.getItem("site-lang");
  if (saved === "en" || saved === "ru") start = saved;
} catch (_) {}
applyLang(start);
