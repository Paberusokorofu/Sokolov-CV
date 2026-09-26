(function () {
  const DEALS_HEADERS = ["deal_id", "deal_code", "deal_name", "epic", "stage", "amount_rub", "owner", "q1_status"];
  const DEALS_ROWS = [
    [1, "D-2026-01", "Северный банк — лицензии", "AI-скоринг сделок", "Negotiation", 4850000, "Иванова М.", "won"],
    [2, "D-2026-02", "Нефтегаз Логистик", "Автоматизация согласований", "Proposal", 3200000, "Петров А.", "open"],
    [3, "D-2026-03", "Городской портал", "Дашборд совета директоров", "Discovery", 1950000, "Сидорова Е.", "open"],
    [4, "D-2026-04", "Ритейл Холдинг+", "AI-скоринг сделок", "Closed Won", 6100000, "Иванова М.", "won"],
    [5, "D-2026-05", "Страховая Линия", "Операционный playbook AI", "Negotiation", 2740000, "Козлов Д.", "open"],
    [6, "D-2026-06", "Финтех Мост", "Интеграция CRM→Jira", "Proposal", 4120000, "Петров А.", "risk"],
    [7, "D-2026-07", "Агротрейд Восток", "Автоматизация согласований", "Discovery", 1480000, "Сидорова Е.", "open"],
    [8, "D-2026-08", "Медсеть Альфа", "Дашборд совета директоров", "Negotiation", 3560000, "Козлов Д.", "open"],
    [9, "D-2026-09", "Энергоучёт Сибирь", "AI-скоринг сделок", "Proposal", 2990000, "Иванова М.", "open"],
    [10, "D-2026-10", "Логистика Юг", "Интеграция CRM→Jira", "Closed Lost", 1220000, "Петров А.", "lost"],
    [11, "D-2026-11", "Банк Приморье", "Операционный playbook AI", "Discovery", 5400000, "Сидорова Е.", "open"],
    [12, "D-2026-12", "Девелопер Квартал", "Автоматизация согласований", "Negotiation", 3880000, "Козлов Д.", "open"],
    [13, "D-2026-13", "Телеком Волна", "Дашборд совета директоров", "Proposal", 2150000, "Иванова М.", "risk"],
    [14, "D-2026-14", "Химпром Север", "AI-скоринг сделок", "Discovery", 1760000, "Петров А.", "open"],
  ];

  const DOCS = {
    deals: {
      id: "deals",
      kind: "xlsx",
      fileName: "deals_q1_2026.xlsx",
      path: "assets/docs/deals_q1_2026.xlsx",
      icon: "XLS",
      headers: DEALS_HEADERS,
      rows: DEALS_ROWS,
    },
    roadmap: {
      id: "roadmap",
      kind: "docx",
      fileName: "roadmap_sdelka_plus.docx",
      path: "assets/docs/roadmap_sdelka_plus.docx",
      icon: "DOC",
      title: "Дорожная карта «Сделка+» — Q1–Q2 2026",
      sections: [
        {
          h: "Контекст",
          p: "B2B CRM «Сделка+»: связать воронку сделок, согласования и отчётность совета директоров через AI-контур.",
        },
        {
          h: "E1 · AI-скоринг сделок",
          p: "Win-probability по открытой воронке. Якоря: D-2026-01, D-2026-04, D-2026-09, D-2026-14.",
        },
        {
          h: "E2 · Автоматизация согласований",
          p: "Маршруты Change Request → Legal/Security. Якоря: D-2026-02, D-2026-07, D-2026-12.",
        },
        {
          h: "E3 · Дашборд совета директоров",
          p: "Единый пакет KPI и слайдов. Якоря: D-2026-03, D-2026-08, D-2026-13.",
        },
        {
          h: "E4 · Интеграция CRM→Jira",
          p: "Автосоздание эпиков из won-сделок. Якоря: D-2026-06, D-2026-10.",
        },
        {
          h: "E5 · Операционный playbook AI",
          p: "Роли, cadence, эскалации агента. Якоря: D-2026-05, D-2026-11.",
        },
        {
          h: "Вехи Q1",
          list: [
            "W1 · Утвердить цели продукта 2026",
            "W2 · Пилот AI-скоринга на 4 сделках",
            "W3 · Пакет согласования изменений v1",
            "W4 · Презентация совету директоров (март)",
          ],
        },
      ],
    },
    goals: {
      id: "goals",
      kind: "pdf",
      fileName: "product_goals_2026.pdf",
      path: "assets/docs/product_goals_2026.pdf",
      icon: "PDF",
      title: "Цели продукта «Сделка+» на 2026",
      goals: [
        { id: "G1", text: "AI-скоринг сделок — ≥70% coverage открытой воронки к Q2.", epic: "E1" },
        { id: "G2", text: "Автоматизация согласований — −40% lead time Change Request.", epic: "E2" },
        { id: "G3", text: "Дашборд совета директоров — ежемесячный пакет без ручной сборки.", epic: "E3" },
        { id: "G4", text: "Интеграция CRM→Jira — 100% won-сделок порождают эпик.", epic: "E4" },
        { id: "G5", text: "Операционный playbook AI — агент: weekly digest + эскалации.", epic: "E5" },
      ],
      footer: "Владелец: Product Owner · горизонт FY2026 · фокус Q1–Q2 · сделки D-2026-01…D-2026-14",
    },
  };

  const JIRA_TASKS = [
    { key: "SP-101", role: "CEO", title: "Утвердить рамку AI-контура «Сделка+» на Q1", epic: "E3" },
    { key: "SP-102", role: "Product Owner", title: "Декомпозировать цели G1–G5 в бэклог эпиков E1–E5", epic: "E1" },
    { key: "SP-103", role: "Project Manager", title: "Собрать план-график вех W1–W4 и зависимости", epic: "E5" },
    { key: "SP-104", role: "Business Analyst", title: "Описать AS-IS воронку и правила скоринга (D-2026-01/04/09)", epic: "E1" },
    { key: "SP-105", role: "Sales Ops", title: "Разметить стадии Negotiation/Proposal в CRM для пилота", epic: "E1" },
    { key: "SP-106", role: "Backend", title: "API CRM→Jira: создание эпика при Closed Won", epic: "E4" },
    { key: "SP-107", role: "Frontend", title: "Карточка скоринга сделки в UI «Сделка+»", epic: "E1" },
    { key: "SP-108", role: "QA", title: "Регресс маршрутов согласования Change Request", epic: "E2" },
    { key: "SP-109", role: "Data Analyst", title: "Модель win-probability + калибровка на Q1 won/lost", epic: "E1" },
    { key: "SP-110", role: "Product Designer", title: "Макет дашборда совета директоров (KPI + риски)", epic: "E3" },
    { key: "SP-111", role: "Security", title: "Threat model для AI-агента и доступа к CRM", epic: "E5" },
    { key: "SP-112", role: "Legal", title: "Чек-лист пакета согласования изменений v1", epic: "E2" },
  ];

  function t(key, fallback) {
    const lang = document.documentElement.lang || "ru";
    const dict = (window.I18N && window.I18N[lang]) || {};
    return dict[key] || fallback || key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtMoney(n) {
    return Number(n).toLocaleString("ru-RU");
  }

  function renderDocPreview(root, fileId) {
    const doc = DOCS[fileId];
    const nameEl = root.querySelector("[data-preview-name]");
    const tableEl = root.querySelector("[data-preview-table]");
    const titleEl = root.querySelector("[data-preview-title]");
    if (!doc || !nameEl || !tableEl) return;

    nameEl.textContent = doc.fileName;
    nameEl.removeAttribute("data-i18n");
    if (titleEl) {
      titleEl.textContent = t("auto_preview_title", "Превью документа");
      titleEl.setAttribute("data-i18n", "auto_preview_title");
    }

    if (doc.kind === "xlsx") {
      const head = doc.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
      const body = doc.rows
        .map((row) => {
          const cells = row.map((c, i) => {
            const v = doc.headers[i] === "amount_rub" ? fmtMoney(c) : c;
            return `<td>${escapeHtml(v)}</td>`;
          });
          return `<tr>${cells.join("")}</tr>`;
        })
        .join("");
      tableEl.innerHTML = `<table class="knz-xlsx"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
      return;
    }

    if (doc.kind === "docx") {
      const parts = doc.sections
        .map((s) => {
          let html = `<section class="knz-doc-block"><h4>${escapeHtml(s.h)}</h4>`;
          if (s.p) html += `<p>${escapeHtml(s.p)}</p>`;
          if (s.list) {
            html += `<ol>${s.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ol>`;
          }
          html += "</section>";
          return html;
        })
        .join("");
      tableEl.innerHTML = `<article class="knz-doc knz-doc--word"><header class="knz-doc__banner">${escapeHtml(
        doc.title
      )}</header>${parts}</article>`;
      return;
    }

    if (doc.kind === "pdf") {
      const goals = doc.goals
        .map(
          (g) =>
            `<li class="knz-pdf-goal"><span class="knz-pdf-goal__id">${escapeHtml(g.id)}</span><span class="knz-pdf-goal__text">${escapeHtml(
              g.text
            )}</span><span class="knz-pdf-goal__epic">${escapeHtml(g.epic)}</span></li>`
        )
        .join("");
      tableEl.innerHTML = `<article class="knz-doc knz-doc--pdf"><header class="knz-doc__banner">${escapeHtml(
        doc.title
      )}</header><ul class="knz-pdf-list">${goals}</ul><p class="knz-doc__foot">${escapeHtml(doc.footer)}</p></article>`;
    }
  }

  function renderCombinedBrief(root) {
    const nameEl = root.querySelector("[data-preview-name]");
    const tableEl = root.querySelector("[data-preview-table]");
    const titleEl = root.querySelector("[data-preview-title]");
    if (!nameEl || !tableEl) return;

    nameEl.textContent = t("auto_preview_merge", "Слияние контекста · Сделка+");
    nameEl.removeAttribute("data-i18n");
    if (titleEl) {
      titleEl.textContent = t("auto_preview_brief", "Сводный бриф");
      titleEl.removeAttribute("data-i18n");
    }

    const openDeals = DEALS_ROWS.filter((r) => r[7] === "open" || r[7] === "risk").length;
    const won = DEALS_ROWS.filter((r) => r[7] === "won").length;
    const pipeline = DEALS_ROWS.reduce((s, r) => s + r[5], 0);

    tableEl.innerHTML = `<article class="knz-doc knz-doc--brief">
      <header class="knz-doc__banner">${escapeHtml(t("auto_brief_title", "Сводный бриф по прикреплённым документам"))}</header>
      <section class="knz-doc-block">
        <h4>${escapeHtml(t("auto_brief_src", "Источники"))}</h4>
        <ul>
          <li><strong>deals_q1_2026.xlsx</strong> — ${DEALS_ROWS.length} сделок, pipeline ${escapeHtml(fmtMoney(pipeline))} ₽</li>
          <li><strong>roadmap_sdelka_plus.docx</strong> — эпики E1–E5, вехи W1–W4</li>
          <li><strong>product_goals_2026.pdf</strong> — цели G1–G5 на FY2026</li>
        </ul>
      </section>
      <section class="knz-doc-block">
        <h4>${escapeHtml(t("auto_brief_insights", "Сшитые сигналы"))}</h4>
        <ul>
          <li>Открытых/риск сделок: <strong>${openDeals}</strong>, won в Q1: <strong>${won}</strong></li>
          <li>Скоринг (E1/G1) опирается на D-2026-01, 04, 09, 14</li>
          <li>Согласования (E2/G2) — D-2026-02, 07, 12 + пакет Legal/Security</li>
          <li>Совет директоров (E3/G3) — дашборд + презентация из того же контура KPI</li>
          <li>CRM→Jira (E4/G4) и playbook агента (E5/G5) закрывают операционный контур</li>
        </ul>
      </section>
      <p class="knz-doc__foot">${escapeHtml(
        t("auto_brief_hint", "Клик по карточке файла — превью этого документа. AI Хаб — артефакты по полному контексту.")
      )}</p>
    </article>`;
  }

  function clearPreview(root) {
    const nameEl = root.querySelector("[data-preview-name]");
    const tableEl = root.querySelector("[data-preview-table]");
    const titleEl = root.querySelector("[data-preview-title]");
    if (nameEl) {
      nameEl.textContent = t("auto_preview_empty", "Кликните файл или заполните слоты");
      nameEl.setAttribute("data-i18n", "auto_preview_empty");
    }
    if (titleEl) {
      titleEl.textContent = t("auto_preview_title", "Превью документа");
      titleEl.setAttribute("data-i18n", "auto_preview_title");
    }
    if (tableEl) {
      tableEl.innerHTML = `<p class="knz-preview__placeholder" data-i18n="auto_preview_hint">${escapeHtml(
        t("auto_preview_hint", "Превью появится здесь")
      )}</p>`;
    }
  }

  function epicPipelineBars() {
    const byEpic = {};
    DEALS_ROWS.forEach((r) => {
      const epic = r[3];
      byEpic[epic] = (byEpic[epic] || 0) + r[5];
    });
    const entries = Object.entries(byEpic).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map((e) => e[1]), 1);
    const bars = entries
      .map(([name, sum]) => {
        const pct = Math.round((sum / max) * 100);
        const short = name.replace("Автоматизация согласований", "Согласования")
          .replace("Дашборд совета директоров", "Дашборд совета")
          .replace("Интеграция CRM→Jira", "CRM→Jira")
          .replace("Операционный playbook AI", "Playbook AI")
          .replace("AI-скоринг сделок", "AI-скоринг");
        const isHot = name.includes("CRM→Jira") || name.includes("Дашборд");
        return `<div class="knz-burn__row${isHot ? " is-hot" : ""}">
          <span class="knz-burn__label">${escapeHtml(short)}</span>
          <span class="knz-burn__track"><span class="knz-burn__fill" style="width:${pct}%"></span></span>
          <span class="knz-burn__val">${escapeHtml(fmtMoney(sum))} ₽</span>
        </div>`;
      })
      .join("");
    return `<div class="knz-viz">
      <h4 class="knz-viz__title">Где горят деньги · pipeline по эпикам</h4>
      <div class="knz-burn">${bars}</div>
      <p class="knz-viz__note">Риск-якоря: D-2026-06 (CRM→Jira), D-2026-13 (дашборд) — status=risk</p>
    </div>`;
  }

  function strategyRoadmapViz() {
    const bets = [
      { q: "Q1 · янв", label: "E1 Скоринг", w: "W2", status: "active" },
      { q: "Q1 · фев", label: "E2 Согласования", w: "W3", status: "active" },
      { q: "Q1 · мар", label: "E3 Совет KPI", w: "W4", status: "next" },
      { q: "Q2 · апр", label: "E4+E5 Scale", w: "G4/G5", status: "planned" },
    ];
    const lanes = bets
      .map(
        (b) =>
          `<div class="knz-road__lane knz-road__lane--${b.status}">
            <span class="knz-road__q">${escapeHtml(b.q)}</span>
            <span class="knz-road__bar"><span class="knz-road__fill"></span></span>
            <span class="knz-road__bet">${escapeHtml(b.label)}</span>
            <span class="knz-road__mile">${escapeHtml(b.w)}</span>
          </div>`
      )
      .join("");
    return `<div class="knz-viz">
      <h4 class="knz-viz__title">Квартальный roadmap · 4 ставки</h4>
      <div class="knz-road" role="img" aria-label="Квартальный roadmap ставок E1–E5">${lanes}</div>
    </div>`;
  }

  function approveFlowViz() {
    const steps = [
      { role: "Product", status: "done", hint: "CR draft" },
      { role: "Project", status: "done", hint: "план W*" },
      { role: "Security", status: "active", hint: "threat model" },
      { role: "CEO", status: "wait", hint: "go / no-go" },
    ];
    const nodes = steps
      .map(
        (s, i) =>
          `${i ? '<span class="knz-flow__arrow" aria-hidden="true">→</span>' : ""}
          <div class="knz-flow__node knz-flow__node--${s.status}">
            <strong>${escapeHtml(s.role)}</strong>
            <span>${escapeHtml(s.hint)}</span>
            <em class="knz-flow__badge">${s.status === "done" ? "ok" : s.status === "active" ? "in review" : "pending"}</em>
          </div>`
      )
      .join("");
    const raci = [
      ["CR AI-скоринг", "A", "C", "R", "I"],
      ["CR Согласования", "C", "A", "C", "I"],
      ["CR Дашборд", "C", "R", "C", "A"],
      ["Threat model", "I", "C", "A", "I"],
    ];
    const rows = raci
      .map(
        (r) =>
          `<tr><th scope="row">${escapeHtml(r[0])}</th>${r
            .slice(1)
            .map((c) => `<td class="knz-raci__cell knz-raci__cell--${c.toLowerCase()}">${c}</td>`)
            .join("")}</tr>`
      )
      .join("");
    return `<div class="knz-viz">
      <h4 class="knz-viz__title">Маршрут согласования</h4>
      <div class="knz-flow">${nodes}</div>
      <h4 class="knz-viz__title">RACI · мини-матрица</h4>
      <table class="knz-raci">
        <thead><tr><th></th><th>Product</th><th>Project</th><th>Security</th><th>CEO</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="knz-viz__note">R = Responsible · A = Accountable · C = Consulted · I = Informed</p>
    </div>`;
  }

  function playbookProcessViz() {
    const steps = [
      { id: "1", name: "Discover", desc: "G1–G5 / E1–E5" },
      { id: "2", name: "Pilot", desc: "4 якоря скоринга" },
      { id: "3", name: "Scale", desc: "CRM→Jira + CR" },
      { id: "4", name: "Govern", desc: "агент + совет" },
    ];
    const road = steps
      .map(
        (s, i) =>
          `${i ? '<span class="knz-steps__conn" aria-hidden="true"></span>' : ""}
          <div class="knz-steps__item">
            <span class="knz-steps__num">${s.id}</span>
            <strong>${escapeHtml(s.name)}</strong>
            <span>${escapeHtml(s.desc)}</span>
          </div>`
      )
      .join("");
    const matrix = [
      ["PO", "скоринг priority", "бэклог CR", "KPI совета"],
      ["PM", "план W1–W4", "зависимости", "эскалации"],
      ["Sales Ops", "разметка стадий", "pilot review", "—"],
      ["Security", "threat model", "доступ CRM", "аудит агента"],
    ];
    const head = ["Роль", "Discover", "Pilot / Scale", "Govern"];
    const body = matrix
      .map(
        (r) =>
          `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`)).join("")}</tr>`
      )
      .join("");
    return `<div class="knz-viz">
      <h4 class="knz-viz__title">Process roadmap</h4>
      <div class="knz-steps">${road}</div>
      <h4 class="knz-viz__title">Роль × AI-ассистент</h4>
      <table class="knz-xlsx knz-xlsx--compact knz-matrix">
        <thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  }

  function artifactHtml(action) {
    if (action === "jira") {
      const rows = JIRA_TASKS.map(
        (task) =>
          `<tr><td>${escapeHtml(task.key)}</td><td><span class="knz-role">${escapeHtml(task.role)}</span></td><td>${escapeHtml(
            task.title
          )}</td><td>${escapeHtml(task.epic)}</td></tr>`
      ).join("");
      return `<div class="knz-art">
        <p class="knz-art__meta">Превью · Jira board «Сделка+» · sample, без API</p>
        <table class="knz-xlsx knz-xlsx--compact"><thead><tr><th>Key</th><th>Role</th><th>Summary</th><th>Epic</th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    }

    if (action === "strategy") {
      return `<div class="knz-art">
        <p class="knz-art__meta">Стратегия развития · Q1–Q2 2026 · «Сделка+»</p>
        <ol class="knz-art__list">
          <li><strong>Фокус:</strong> E1 скоринг + E2 согласования как рычаги pipeline quality.</li>
          <li><strong>Дистрибуция ценности:</strong> E3 дашборд совета — единый язык KPI для CEO/PO.</li>
          <li><strong>Системность:</strong> E4 CRM→Jira убирает ручной handoff won→delivery.</li>
          <li><strong>Операции:</strong> E5 playbook агента держит cadence и эскалации без нового git-репо.</li>
          <li><strong>Риски Q1:</strong> D-2026-06 / D-2026-13 (status=risk) — отдельный review у Sales Ops + BA.</li>
          <li><strong>Инвестиции:</strong> приоритет Data Analyst + Backend на G1/G4; Legal/Security на пакет согласования.</li>
        </ol>
        ${strategyRoadmapViz()}
        ${epicPipelineBars()}
      </div>`;
    }

    if (action === "board") {
      const slides = [
        { n: "01", t: "Повестка", b: "Цели G1–G5, статус воронки Q1, решение по AI-контуру." },
        { n: "02", t: "Воронка", b: `14 сделок · pipeline ${fmtMoney(DEALS_ROWS.reduce((s, r) => s + r[5], 0))} ₽ · won/risk/open.` },
        { n: "03", t: "AI-скоринг", b: "Пилот на D-2026-01/04/09/14 · цель G1 ≥70% coverage." },
        { n: "04", t: "Согласования", b: "−40% lead time CR (G2) · пакет Legal/Security v1." },
        { n: "05", t: "Совет KPI", b: "Ежемесячный пакет без ручной сборки (G3 / E3)." },
        { n: "06", t: "Решение", b: "Утвердить W2–W4 и бриф агента на weekly digest." },
      ]
        .map(
          (s) =>
            `<article class="knz-slide"><span class="knz-slide__n">${s.n}</span><h4>${escapeHtml(s.t)}</h4><p>${escapeHtml(
              s.b
            )}</p></article>`
        )
        .join("");
      return `<div class="knz-art"><p class="knz-art__meta">Презентация для совета директоров · карточный превью</p><div class="knz-slides">${slides}</div></div>`;
    }

    if (action === "approve") {
      return `<div class="knz-art">
        <p class="knz-art__meta">Пакет согласования изменений · v1 (превью)</p>
        <ul class="knz-art__list">
          <li><strong>CR-2026-AI-01</strong> — внедрение AI-скоринга в CRM (E1) · владельцы: PO, Security, Legal</li>
          <li><strong>CR-2026-AI-02</strong> — маршруты согласования Change Request (E2) · BA, Legal</li>
          <li><strong>CR-2026-AI-03</strong> — публикация дашборда совета (E3) · PM, CEO</li>
          <li><strong>Приложения:</strong> цели G1–G5, дорожная карта E1–E5, выборка сделок D-2026-*</li>
          <li><strong>Критерии приёмки:</strong> threat model, DPIA-лайт, чек-лист Legal, DoD Jira</li>
          <li><strong>Статус:</strong> draft → на согласовании (симуляция, без внешней отправки)</li>
        </ul>
        ${approveFlowViz()}
      </div>`;
    }

    if (action === "playbook") {
      return `<div class="knz-art">
        <p class="knz-art__meta">Операционный playbook внедрения AI · не git-репозиторий</p>
        <ol class="knz-art__list">
          <li><strong>Подготовка:</strong> зафиксировать G1–G5 и эпики E1–E5 как единственный бэклог-источник.</li>
          <li><strong>Пилот:</strong> скоринг на 4 якорях (D-2026-01/04/09/14), еженедельный разбор Sales Ops.</li>
          <li><strong>Согласования:</strong> каждый CR проходит Security → Legal → PO; SLA из G2.</li>
          <li><strong>Интеграция:</strong> won → эпик Jira (E4); ручной обход запрещён.</li>
          <li><strong>Отчётность:</strong> пакет совета собирается из того же контура KPI (E3).</li>
          <li><strong>Агент:</strong> weekly digest, эскалации risk-сделок, без новых репозиториев кода.</li>
          <li><strong>Ретро Q1:</strong> coverage скоринга, lead time CR, % won→эпик.</li>
        </ol>
        ${playbookProcessViz()}
      </div>`;
    }

    if (action === "agent") {
      return `<div class="knz-art">
        <p class="knz-art__meta">Бриф AI-агенту · мониторинг прогресса «Сделка+»</p>
        <section class="knz-doc-block">
          <h4>KPI</h4>
          <ul>
            <li>G1 coverage скоринга ≥ 70%</li>
            <li>G2 lead time CR −40% к baseline</li>
            <li>G4 100% Closed Won → эпик Jira</li>
            <li>Risk-сделки (D-2026-06, D-2026-13): age &lt; 14 дней без апдейта → эскалация</li>
          </ul>
        </section>
        <section class="knz-doc-block">
          <h4>Cadence</h4>
          <ul>
            <li>Daily: скан статусов воронки и открытых CR</li>
            <li>Weekly digest (пн 10:00): KPI + блокеры → PO / PM</li>
            <li>Monthly: пакет для совета (E3)</li>
          </ul>
        </section>
        <section class="knz-doc-block">
          <h4>Каналы оповещений</h4>
          <ul>
            <li><strong>Связать с Telegram-ботом</strong> — алерты L1/L2 в канал <code>@sdelka_plus_agent_bot</code> (chat_id симуляции: <code>-1002984710021</code>)</li>
            <li><strong>Присылать упоминания на почту</strong> — digests и @mentions: <code>po@sdelka.plus</code>, <code>pm@sdelka.plus</code>, при L3 — <code>ceo@sdelka.plus</code></li>
          </ul>
        </section>
        <section class="knz-doc-block">
          <h4>Эскалации</h4>
          <ul>
            <li>L1 → Sales Ops / BA</li>
            <li>L2 → Product Owner / Project Manager</li>
            <li>L3 → CEO (срыв W-вехи или Security/Legal блок &gt; 5 р.д.)</li>
          </ul>
        </section>
        <section class="knz-doc-block">
          <h4>Шаблон digest</h4>
          <pre class="knz-art__pre">[Сделка+] Week {N}
KPI: G1 {cov}% · G2 lead {days}д · G4 won→эпик {pct}%
Блокеры: {list}
Risk: D-2026-06, D-2026-13 — age / last update
Next: W-веха + owner</pre>
        </section>
        <section class="knz-doc-block">
          <h4>Границы</h4>
          <ul>
            <li>Только чтение CRM/Jira-метрик и сбор digest — без правок сделок и создания задач без подтверждения PO</li>
            <li>Не создавать git-репозитории и не ходить во внешние API вне whitelist (Telegram bot + SMTP stub)</li>
            <li>Персданные клиентов — только агрегаты / deal_code, без выгрузки PII в канал</li>
          </ul>
        </section>
        <p class="knz-doc__foot">Команда принята (симуляция). Агент не создаёт git-репо и не ходит во внешние API.</p>
      </div>`;
    }

    return `<p class="knz-preview__placeholder">Нет превью</p>`;
  }

  function showArtifact(root, action) {
    const panel = root.querySelector("[data-artifact-panel]");
    const title = root.querySelector("[data-artifact-title]");
    const body = root.querySelector("[data-artifact-body]");
    if (!panel || !body) return;

    const titles = {
      jira: t("auto_hub_jira", "Сформировать задачи Jira"),
      strategy: t("auto_hub_strategy", "Стратегия развития на квартал"),
      board: t("auto_hub_board", "Презентация для совета директоров"),
      approve: t("auto_hub_approve_pkg", "Пакет согласования изменений"),
      playbook: t("auto_hub_playbook", "Операционный playbook внедрения AI"),
      agent: t("auto_hub_agent", "Дать команду AI-агенту отслеживать прогресс"),
    };

    if (title) title.textContent = titles[action] || action;
    body.innerHTML = artifactHtml(action);
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function anchorRight(el, container) {
    const cr = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.right - cr.left, y: r.top + r.height / 2 - cr.top };
  }

  function anchorLeft(el, container) {
    const cr = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - cr.left, y: r.top + r.height / 2 - cr.top };
  }

  function pathStraight(a, b) {
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }

  function pathViaHub(a, hubIn, hubOut, b) {
    const c1x = a.x + (hubIn.x - a.x) * 0.55;
    const c2x = hubOut.x + (b.x - hubOut.x) * 0.45;
    return `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${hubIn.x} ${hubIn.y}, ${hubIn.x} ${hubIn.y} L ${hubOut.x} ${hubOut.y} C ${hubOut.x} ${hubOut.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`;
  }

  function addSpark(svg, ns, d, len, className, dashLen, offset) {
    const spark = document.createElementNS(ns, "path");
    spark.setAttribute("d", d);
    spark.setAttribute("class", `knz-wire ${className}`);
    const gap = Math.max(48, len * 0.48);
    spark.style.strokeDasharray = `${dashLen} ${gap}`;
    spark.style.strokeDashoffset = String(offset || 0);
    svg.appendChild(spark);
  }

  function addDot(svg, ns, pt, lit) {
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", String(pt.x));
    dot.setAttribute("cy", String(pt.y));
    dot.setAttribute("r", lit ? "6.5" : "4.25");
    dot.setAttribute("class", lit ? "knz-wire-dot knz-wire-dot--lit" : "knz-wire-dot");
    svg.appendChild(dot);
  }

  function redrawWires(root) {
    const stage = root.querySelector("[data-knz-stage]");
    const svg = root.querySelector("[data-knz-wires]");
    const hub = root.querySelector("[data-knz-hub]");
    if (!stage || !svg) return;

    const fr = stage.getBoundingClientRect();
    svg.setAttribute("width", String(fr.width));
    svg.setAttribute("height", String(fr.height));
    svg.setAttribute("viewBox", `0 0 ${fr.width} ${fr.height}`);

    const files = [...root.querySelectorAll(".knz-file")];
    const slots = [...root.querySelectorAll(".knz-slot")];
    const ns = "http://www.w3.org/2000/svg";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const hubLeft = hub ? anchorLeft(hub, stage) : null;
    const hubRight = hub ? anchorRight(hub, stage) : null;

    files.forEach((fileEl, fi) => {
      const fileId = fileEl.dataset.fileId;
      const placedSlot = slots.find((s) => s.dataset.fileId === fileId);
      if (!placedSlot && !slots[fi]) return;

      const target = placedSlot || slots[Math.min(fi, slots.length - 1)];
      const start = anchorRight(fileEl, stage);
      const end = anchorLeft(target, stage);
      const connected = Boolean(placedSlot);

      let d;
      let midIn = null;
      let midOut = null;
      if (hubLeft && hubRight) {
        midIn = { x: hubLeft.x, y: start.y };
        midOut = { x: hubRight.x, y: end.y };
        d = pathViaHub(start, midIn, midOut, end);
      } else {
        d = pathStraight(start, end);
      }

      const base = document.createElementNS(ns, "path");
      base.setAttribute("d", d);
      base.setAttribute("class", connected ? "knz-wire knz-wire--active" : "knz-wire");
      base.dataset.fileId = fileId;
      svg.appendChild(base);

      if (connected) {
        const len = Math.max(
          120,
          Math.hypot(end.x - start.x, end.y - start.y) + Math.abs((midOut?.x || 0) - (midIn?.x || 0)) * 0.35
        );
        addSpark(svg, ns, d, len, "knz-wire--spark", 14, 0);
        addSpark(svg, ns, d, len, "knz-wire--spark-2", 9, -Math.round(len * 0.28));
      }

      addDot(svg, ns, start, connected);
      if (midIn) addDot(svg, ns, midIn, connected);
      if (midOut) addDot(svg, ns, midOut, connected);
      addDot(svg, ns, end, connected);
    });
  }

  function setHubReady(hub, ready) {
    if (!hub) return;
    hub.classList.toggle("is-ready", ready);
    hub.querySelectorAll("[data-hub-action]").forEach((el) => {
      el.hidden = !ready;
      if (el.tagName === "BUTTON") {
        el.disabled = !ready;
      } else {
        el.setAttribute("aria-disabled", ready ? "false" : "true");
        el.tabIndex = ready ? 0 : -1;
      }
    });
  }

  function bindTool(root) {
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";

    const slotsState = [null, null, null];
    let dragFileId = null;
    let clickPreviewId = null;
    let previewMode = "idle";

    const hub = root.querySelector("[data-knz-hub]");
    const artifactPanel = root.querySelector("[data-artifact-panel]");

    function filledCount() {
      return slotsState.filter(Boolean).length;
    }

    function refreshPreview() {
      if (previewMode === "file" && clickPreviewId) {
        renderDocPreview(root, clickPreviewId);
        return;
      }
      if (filledCount() === 3) {
        renderCombinedBrief(root);
        return;
      }
      if (clickPreviewId) {
        renderDocPreview(root, clickPreviewId);
        return;
      }
      clearPreview(root);
    }

    function updateChrome() {
      const n = filledCount();
      setHubReady(hub, n === 3);
      if (n < 3 && artifactPanel) artifactPanel.hidden = true;
      root.querySelectorAll(".knz-file").forEach((el) => {
        const id = el.dataset.fileId;
        const used = slotsState.includes(id);
        el.classList.toggle("is-used", used);
        el.draggable = !used;
        el.setAttribute("aria-disabled", used ? "true" : "false");
      });
      redrawWires(root);
      if (previewMode !== "file") {
        if (n === 3) previewMode = "brief";
        else if (!clickPreviewId) previewMode = "idle";
      }
      refreshPreview();
    }

    function placeFile(fileId, slotIndex) {
      if (!DOCS[fileId]) return;
      if (slotsState.includes(fileId)) return;
      if (slotsState[slotIndex]) return;
      slotsState[slotIndex] = fileId;
      const slot = root.querySelector(`[data-slot="${slotIndex}"]`);
      if (!slot) return;
      slot.dataset.empty = "false";
      slot.dataset.fileId = fileId;
      slot.classList.add("is-filled");
      const label = slot.querySelector(".knz-slot__label");
      if (label) {
        label.textContent = DOCS[fileId].fileName;
        label.removeAttribute("data-i18n");
      }
      const clear = slot.querySelector("[data-slot-clear]");
      if (clear) clear.hidden = false;
      previewMode = filledCount() === 3 ? "brief" : previewMode === "file" ? "file" : "brief";
      if (filledCount() < 3 && previewMode !== "file") previewMode = "idle";
      if (filledCount() === 3) previewMode = "brief";
      else if (previewMode !== "file") clickPreviewId = fileId;
      updateChrome();
    }

    function clearSlot(slotIndex) {
      slotsState[slotIndex] = null;
      const slot = root.querySelector(`[data-slot="${slotIndex}"]`);
      if (!slot) return;
      slot.dataset.empty = "true";
      delete slot.dataset.fileId;
      slot.classList.remove("is-filled");
      const label = slot.querySelector(".knz-slot__label");
      if (label) {
        label.textContent = t("auto_slot_empty", "Пустой слот");
        label.setAttribute("data-i18n", "auto_slot_empty");
      }
      const clear = slot.querySelector("[data-slot-clear]");
      if (clear) clear.hidden = true;
      if (filledCount() < 3) {
        if (artifactPanel) artifactPanel.hidden = true;
        if (previewMode === "brief") previewMode = clickPreviewId ? "file" : "idle";
      }
      updateChrome();
    }

    function showFile(fileId) {
      clickPreviewId = fileId;
      previewMode = "file";
      renderDocPreview(root, fileId);
    }

    root.querySelectorAll(".knz-file").forEach((el) => {
      el.addEventListener("click", () => showFile(el.dataset.fileId));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showFile(el.dataset.fileId);
        }
      });
      el.addEventListener("dragstart", (e) => {
        if (el.classList.contains("is-used")) {
          e.preventDefault();
          return;
        }
        dragFileId = el.dataset.fileId;
        el.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", dragFileId);
      });
      el.addEventListener("dragend", () => {
        el.classList.remove("is-dragging");
        dragFileId = null;
        root.querySelectorAll(".knz-slot").forEach((s) => s.classList.remove("is-over"));
      });
    });

    root.querySelectorAll(".knz-slot").forEach((slot) => {
      const idx = Number(slot.dataset.slot);
      slot.addEventListener("dragover", (e) => {
        if (slot.dataset.empty !== "true") return;
        e.preventDefault();
        slot.classList.add("is-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("is-over");
        const id = e.dataTransfer.getData("text/plain") || dragFileId;
        if (id) placeFile(id, idx);
      });
      slot.querySelector("[data-slot-clear]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        clearSlot(idx);
      });
    });

    hub?.addEventListener("click", (e) => {
      if (!hub.classList.contains("is-ready")) {
        e.preventDefault();
        return;
      }
      const btn = e.target.closest("[data-hub-action]");
      if (!btn || btn.hidden) return;
      e.preventDefault();
      showArtifact(root, btn.dataset.hubAction);
    });

    root.querySelector("[data-artifact-close]")?.addEventListener("click", () => {
      if (artifactPanel) artifactPanel.hidden = true;
    });

    const onResize = () => redrawWires(root);
    window.addEventListener("resize", onResize);
    root._knzRedraw = onResize;
    setHubReady(hub, false);
    updateChrome();
    root._knzPlace = placeFile;
    root._knzClear = clearSlot;
  }

  function init() {
    document.querySelectorAll("[data-excel-tool], [data-auto-tool]").forEach((root) => {
      bindTool(root);
      requestAnimationFrame(() => {
        if (root._knzRedraw) root._knzRedraw();
      });
    });
  }

  window.AutomationAI = { init, bindTool, DOCS };
  window.ExcelAI = window.AutomationAI;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
