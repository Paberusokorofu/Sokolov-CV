(function () {
  const CITIES = [
    [1, "Москва"],
    [2, "Санкт-Петербург"],
    [3, "Новосибирск"],
    [4, "Екатеринбург"],
    [5, "Казань"],
    [6, "Нижний Новгород"],
    [7, "Челябинск"],
    [8, "Самара"],
    [9, "Омск"],
    [10, "Ростов-на-Дону"],
    [11, "Уфа"],
    [12, "Красноярск"],
    [13, "Воронеж"],
    [14, "Пермь"],
    [15, "Волгоград"],
    [16, "Краснодар"],
    [17, "Саратов"],
    [18, "Тюмень"],
    [19, "Тольятти"],
    [20, "Ижевск"],
  ];

  const POP = [
    13104000, 5600000, 1633000, 1544000, 1318000, 1226000, 1188000, 1163000, 1126000, 1143000, 1126000, 1093000,
    1052000, 1034000, 1028000, 1099000, 901000, 855000, 684000, 646000,
  ];
  const SAL = [
    148500, 112400, 78500, 81200, 74500, 69800, 67200, 68900, 64100, 68200, 66500, 79800, 65800, 71200, 63800, 72400,
    61200, 89500, 58900, 60100,
  ];
  const GAS = [
    58.4, 57.9, 55.2, 54.8, 53.6, 54.1, 53.9, 54.5, 53.2, 55.8, 53.4, 56.1, 54.0, 54.7, 54.3, 56.8, 53.7, 55.5, 53.1,
    52.9,
  ];

  const DATASETS = {
    population: {
      id: "population",
      fileName: "population_2025.xlsx",
      path: "assets/excel/population_2025.xlsx",
      sheet: "data",
      table: "fact_population",
      headers: ["city_id", "city", "population", "year"],
      rows: CITIES.map(([id, name], i) => [id, name, POP[i], 2025]),
      labelRu: "Население",
    },
    salary: {
      id: "salary",
      fileName: "salary_2025.xlsx",
      path: "assets/excel/salary_2025.xlsx",
      sheet: "data",
      table: "fact_salary",
      headers: ["city_id", "city", "avg_salary_rub", "year"],
      rows: CITIES.map(([id, name], i) => [id, name, SAL[i], 2025]),
      labelRu: "Зарплата",
    },
    gasoline: {
      id: "gasoline",
      fileName: "gasoline_2025.xlsx",
      path: "assets/excel/gasoline_2025.xlsx",
      sheet: "data",
      table: "fact_gasoline",
      headers: ["city_id", "city", "price_rub_per_liter", "fuel_grade", "year"],
      rows: CITIES.map(([id, name], i) => [id, name, GAS[i], "АИ-95", 2025]),
      labelRu: "Бензин",
    },
  };

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

  function sqlStr(v) {
    return `'${String(v).replace(/'/g, "''")}'`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  async function ensureXlsx() {
    if (!window.XLSX) {
      await loadScript("https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js");
    }
  }

  function citiesDdl() {
    const inserts = CITIES.map(([id, name]) => `INSERT INTO cities (city_id, city_name) VALUES (${id}, ${sqlStr(name)});`).join(
      "\n"
    );
    return `-- Dimension: cities
-- PK: city_id
CREATE TABLE IF NOT EXISTS cities (
  city_id   BIGINT PRIMARY KEY,           -- PK
  city_name TEXT NOT NULL,
  CONSTRAINT cities_city_name_uq UNIQUE (city_name),
  CONSTRAINT cities_city_id_chk CHECK (city_id BETWEEN 1 AND 20)
);

COMMENT ON TABLE cities IS 'Справочник городов (измерение для star schema)';
COMMENT ON COLUMN cities.city_id IS 'PK — идентификатор города';
COMMENT ON COLUMN cities.city_name IS 'Название города';

CREATE INDEX IF NOT EXISTS idx_cities_name ON cities (city_name);

${inserts}
`;
  }

  function factDdl(ds) {
    if (ds.id === "population") {
      const inserts = ds.rows
        .map(([cid, , pop, year]) => `INSERT INTO fact_population (city_id, population, year) VALUES (${cid}, ${pop}, ${year});`)
        .join("\n");
      return `-- Fact: population (FK → cities.city_id)
-- PK: (city_id, year)  |  FK: city_id → cities(city_id)
CREATE TABLE IF NOT EXISTS fact_population (
  city_id    BIGINT NOT NULL,             -- FK
  population BIGINT NOT NULL,
  year       SMALLINT NOT NULL DEFAULT 2025,
  PRIMARY KEY (city_id, year),            -- PK composite
  CONSTRAINT fact_population_city_fk
    FOREIGN KEY (city_id) REFERENCES cities (city_id),  -- FK
  CONSTRAINT fact_population_pop_chk CHECK (population > 0),
  CONSTRAINT fact_population_year_chk CHECK (year BETWEEN 2000 AND 2100)
);

COMMENT ON TABLE fact_population IS 'Факт: население по городам';
COMMENT ON COLUMN fact_population.city_id IS 'FK → cities.city_id';
CREATE INDEX IF NOT EXISTS idx_fact_population_year ON fact_population (year);

${inserts}
`;
    }
    if (ds.id === "salary") {
      const inserts = ds.rows
        .map(
          ([cid, , sal, year]) =>
            `INSERT INTO fact_salary (city_id, avg_salary_rub, year) VALUES (${cid}, ${sal}, ${year});`
        )
        .join("\n");
      return `-- Fact: salary (FK → cities.city_id)
-- PK: (city_id, year)  |  FK: city_id → cities(city_id)
CREATE TABLE IF NOT EXISTS fact_salary (
  city_id         BIGINT NOT NULL,        -- FK
  avg_salary_rub  NUMERIC(12, 2) NOT NULL,
  year            SMALLINT NOT NULL DEFAULT 2025,
  PRIMARY KEY (city_id, year),            -- PK composite
  CONSTRAINT fact_salary_city_fk
    FOREIGN KEY (city_id) REFERENCES cities (city_id),  -- FK
  CONSTRAINT fact_salary_amt_chk CHECK (avg_salary_rub > 0),
  CONSTRAINT fact_salary_year_chk CHECK (year BETWEEN 2000 AND 2100)
);

COMMENT ON TABLE fact_salary IS 'Факт: средняя зарплата (руб.)';
COMMENT ON COLUMN fact_salary.city_id IS 'FK → cities.city_id';
CREATE INDEX IF NOT EXISTS idx_fact_salary_year ON fact_salary (year);

${inserts}
`;
    }
    const inserts = ds.rows
      .map(
        ([cid, , price, grade, year]) =>
          `INSERT INTO fact_gasoline (city_id, price_rub_per_liter, fuel_grade, year) VALUES (${cid}, ${price}, ${sqlStr(grade)}, ${year});`
      )
      .join("\n");
    return `-- Fact: gasoline (FK → cities.city_id)
-- PK: (city_id, fuel_grade, year)  |  FK: city_id → cities(city_id)
CREATE TABLE IF NOT EXISTS fact_gasoline (
  city_id              BIGINT NOT NULL,   -- FK
  price_rub_per_liter  NUMERIC(8, 2) NOT NULL,
  fuel_grade           TEXT NOT NULL DEFAULT 'АИ-95',
  year                 SMALLINT NOT NULL DEFAULT 2025,
  PRIMARY KEY (city_id, fuel_grade, year), -- PK composite
  CONSTRAINT fact_gasoline_city_fk
    FOREIGN KEY (city_id) REFERENCES cities (city_id),  -- FK
  CONSTRAINT fact_gasoline_price_chk CHECK (price_rub_per_liter > 0),
  CONSTRAINT fact_gasoline_year_chk CHECK (year BETWEEN 2000 AND 2100)
);

COMMENT ON TABLE fact_gasoline IS 'Факт: цена бензина (руб/л)';
COMMENT ON COLUMN fact_gasoline.city_id IS 'FK → cities.city_id';
CREATE INDEX IF NOT EXISTS idx_fact_gasoline_year ON fact_gasoline (year);

${inserts}
`;
  }

  function combinedView() {
    return `-- Demo VIEW: join всех фактов по city_id
CREATE OR REPLACE VIEW v_city_metrics AS
SELECT
  c.city_id,
  c.city_name,
  p.population,
  s.avg_salary_rub,
  g.price_rub_per_liter,
  g.fuel_grade,
  COALESCE(p.year, s.year, g.year) AS year
FROM cities c
LEFT JOIN fact_population p ON p.city_id = c.city_id
LEFT JOIN fact_salary s ON s.city_id = c.city_id AND s.year = p.year
LEFT JOIN fact_gasoline g ON g.city_id = c.city_id AND g.year = p.year;

COMMENT ON VIEW v_city_metrics IS 'Сводка: население + зарплата + бензин по городам';
`;
  }

  function buildSql(fileIds, { combined = false } = {}) {
    const ids = [...new Set(fileIds.filter(Boolean))];
    const parts = [
      `-- ============================================================`,
      `-- Из Excel в Князи — PostgreSQL star schema`,
      `-- Источники: ${ids.map((id) => DATASETS[id].fileName).join(", ")}`,
      `-- Схема: cities (dim) + fact_* (FK → cities.city_id)`,
      `-- ============================================================`,
      ``,
      `BEGIN;`,
      ``,
      citiesDdl().trim(),
    ];
    ids.forEach((id) => {
      parts.push("");
      parts.push(factDdl(DATASETS[id]).trim());
    });
    if (combined && ids.length === 3) {
      parts.push("");
      parts.push(combinedView().trim());
    }
    parts.push("");
    parts.push("COMMIT;");
    parts.push("");
    return parts.join("\n");
  }

  function extraHeaders(ds) {
    return ds.headers.filter((h) => h !== "city_id" && h !== "city");
  }

  function renderPreview(root, fileId) {
    const ds = DATASETS[fileId];
    const nameEl = root.querySelector("[data-preview-name]");
    const tableEl = root.querySelector("[data-preview-table]");
    if (!ds || !nameEl || !tableEl) return;
    nameEl.textContent = ds.fileName;
    nameEl.removeAttribute("data-i18n");
    const head = ds.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    const body = ds.rows
      .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
      .join("");
    tableEl.innerHTML = `<table class="knz-xlsx"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderMergedPreview(root, fileIds) {
    const nameEl = root.querySelector("[data-preview-name]");
    const tableEl = root.querySelector("[data-preview-table]");
    if (!nameEl || !tableEl) return;
    const ids = fileIds.filter((id) => DATASETS[id]);
    if (!ids.length) {
      nameEl.textContent = t("auto_preview_empty", "Кликните файл или заполните слоты");
      nameEl.setAttribute("data-i18n", "auto_preview_empty");
      tableEl.innerHTML = `<p class="knz-preview__placeholder" data-i18n="auto_preview_hint">${escapeHtml(
        t("auto_preview_hint", "Таблица появится здесь")
      )}</p>`;
      return;
    }

    const baseCols = ["city_id", "city"];
    const blocks = ids.map((id) => {
      const ds = DATASETS[id];
      return { id, ds, cols: extraHeaders(ds) };
    });
    const headers = [...baseCols, ...blocks.flatMap((b) => b.cols)];
    const newFrom = baseCols.length;

    nameEl.textContent = ids.map((id) => DATASETS[id].fileName).join(" + ");
    nameEl.removeAttribute("data-i18n");

    const head = headers
      .map((h, i) => `<th class="${i >= newFrom && blocks.length > 1 ? "is-new" : ""}">${escapeHtml(h)}</th>`)
      .join("");

    const body = CITIES.map(([cid, cname]) => {
      const cells = [cid, cname];
      blocks.forEach(({ ds, cols }) => {
        const row = ds.rows.find((r) => r[0] === cid);
        cols.forEach((col) => {
          const idx = ds.headers.indexOf(col);
          cells.push(row ? row[idx] : "");
        });
      });
      return `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`;
    }).join("");

    tableEl.innerHTML = `<table class="knz-xlsx"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function anchorRight(el, container) {
    const cr = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.right - cr.left,
      y: r.top + r.height / 2 - cr.top,
    };
  }

  function anchorLeft(el, container) {
    const cr = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - cr.left,
      y: r.top + r.height / 2 - cr.top,
    };
  }

  function pathStraight(a, b) {
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }

  function redrawWires(root) {
    const stage = root.querySelector("[data-knz-stage]");
    const svg = root.querySelector("[data-knz-wires]");
    if (!stage || !svg) return;

    const fr = stage.getBoundingClientRect();
    svg.setAttribute("width", String(fr.width));
    svg.setAttribute("height", String(fr.height));
    svg.setAttribute("viewBox", `0 0 ${fr.width} ${fr.height}`);

    const files = [...root.querySelectorAll(".knz-file")];
    const slots = [...root.querySelectorAll(".knz-slot")];
    const ns = "http://www.w3.org/2000/svg";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    files.forEach((fileEl, fi) => {
      const fileId = fileEl.dataset.fileId;
      const placedSlot = slots.find((s) => s.dataset.fileId === fileId);
      if (!placedSlot && !slots[fi]) return;

      const target = placedSlot || slots[Math.min(fi, slots.length - 1)];
      const start = anchorRight(fileEl, stage);
      const end = anchorLeft(target, stage);
      const d = pathStraight(start, end);
      const connected = Boolean(placedSlot);

      const base = document.createElementNS(ns, "path");
      base.setAttribute("d", d);
      base.setAttribute("class", connected ? "knz-wire knz-wire--active" : "knz-wire");
      base.dataset.fileId = fileId;
      svg.appendChild(base);

      if (connected) {
        const spark = document.createElementNS(ns, "path");
        spark.setAttribute("d", d);
        spark.setAttribute("class", "knz-wire knz-wire--spark");
        const len = Math.max(80, Math.hypot(end.x - start.x, end.y - start.y) * 1.2);
        spark.style.strokeDasharray = `10 ${Math.max(40, len * 0.55)}`;
        spark.style.strokeDashoffset = "0";
        svg.appendChild(spark);
      }

      const dotA = document.createElementNS(ns, "circle");
      dotA.setAttribute("cx", String(start.x));
      dotA.setAttribute("cy", String(start.y));
      dotA.setAttribute("r", connected ? "4.5" : "3.5");
      dotA.setAttribute("class", "knz-wire-dot");
      svg.appendChild(dotA);

      const dotB = document.createElementNS(ns, "circle");
      dotB.setAttribute("cx", String(end.x));
      dotB.setAttribute("cy", String(end.y));
      dotB.setAttribute("r", connected ? "4.5" : "3.5");
      dotB.setAttribute("class", "knz-wire-dot");
      svg.appendChild(dotB);
    });
  }

  function setHubReady(hub, ready) {
    if (!hub) return;
    hub.classList.toggle("is-ready", ready);
    hub.querySelectorAll("[data-hub-action]").forEach((el) => {
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

    const sqlBtn = root.querySelector("[data-sql-partial]");
    const hub = root.querySelector("[data-knz-hub]");
    const sqlPanel = root.querySelector("[data-sql-panel]");
    const sqlPre = root.querySelector("[data-excel-sql]");
    const copyBtn = root.querySelector("[data-excel-copy]");

    function filledCount() {
      return slotsState.filter(Boolean).length;
    }

    function refreshPreview() {
      const placed = slotsState.filter(Boolean);
      if (placed.length) {
        renderMergedPreview(root, placed);
      } else if (clickPreviewId) {
        renderPreview(root, clickPreviewId);
      } else {
        renderMergedPreview(root, []);
      }
    }

    function updateChrome() {
      const n = filledCount();
      if (sqlBtn) sqlBtn.hidden = n < 2;
      setHubReady(hub, n === 3);
      root.querySelectorAll(".knz-file").forEach((el) => {
        const id = el.dataset.fileId;
        const used = slotsState.includes(id);
        el.classList.toggle("is-used", used);
        el.draggable = !used;
        el.setAttribute("aria-disabled", used ? "true" : "false");
      });
      redrawWires(root);
      refreshPreview();
    }

    function placeFile(fileId, slotIndex) {
      if (!DATASETS[fileId]) return;
      if (slotsState.includes(fileId)) return;
      if (slotsState[slotIndex]) return;
      slotsState[slotIndex] = fileId;
      const slot = root.querySelector(`[data-slot="${slotIndex}"]`);
      if (!slot) return;
      slot.dataset.empty = "false";
      slot.dataset.fileId = fileId;
      slot.classList.add("is-filled");
      const label = slot.querySelector(".knz-slot__label");
      if (label) label.textContent = DATASETS[fileId].fileName;
      const clear = slot.querySelector("[data-slot-clear]");
      if (clear) clear.hidden = false;
      updateChrome();
    }

    function clearSlot(slotIndex) {
      const fileId = slotsState[slotIndex];
      slotsState[slotIndex] = null;
      const slot = root.querySelector(`[data-slot="${slotIndex}"]`);
      if (!slot) return;
      slot.dataset.empty = "true";
      delete slot.dataset.fileId;
      slot.classList.remove("is-filled");
      const label = slot.querySelector(".knz-slot__label");
      if (label) {
        label.textContent = t("auto_slot_empty", `Слот ${slotIndex + 1}`);
        label.setAttribute("data-i18n", "auto_slot_empty");
      }
      const clear = slot.querySelector("[data-slot-clear]");
      if (clear) clear.hidden = true;
      void fileId;
      updateChrome();
    }

    function showSql(ids, combined) {
      const sql = buildSql(ids, { combined });
      if (sqlPre) sqlPre.textContent = sql;
      if (sqlPanel) {
        sqlPanel.hidden = false;
        sqlPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    root.querySelectorAll(".knz-file").forEach((el) => {
      el.addEventListener("click", () => {
        clickPreviewId = el.dataset.fileId;
        if (!filledCount()) renderPreview(root, clickPreviewId);
        else refreshPreview();
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickPreviewId = el.dataset.fileId;
          if (!filledCount()) renderPreview(root, clickPreviewId);
          else refreshPreview();
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

    sqlBtn?.addEventListener("click", () => {
      showSql(slotsState.filter(Boolean), false);
    });

    hub?.addEventListener("click", (e) => {
      if (!hub.classList.contains("is-ready")) {
        e.preventDefault();
        return;
      }
      const btn = e.target.closest("[data-hub-action]");
      if (!btn) return;
      const action = btn.dataset.hubAction;
      if (action === "pptx") {
        e.preventDefault();
        window.alert(t("auto_stub_pptx", "Скоро: генерация презентации."));
        return;
      }
      if (action === "sql-all") {
        e.preventDefault();
        showSql(["population", "salary", "gasoline"], true);
      }
    });

    copyBtn?.addEventListener("click", async () => {
      const sql = sqlPre?.textContent || "";
      try {
        await navigator.clipboard.writeText(sql);
        copyBtn.textContent = t("auto_sql_copied", "Скопировано");
        setTimeout(() => {
          copyBtn.textContent = t("auto_sql_copy", "Копировать");
        }, 1600);
      } catch (_) {
        /* ignore */
      }
    });

    const onResize = () => redrawWires(root);
    window.addEventListener("resize", onResize);
    root._knzRedraw = onResize;
    setHubReady(hub, false);
    updateChrome();
    ensureXlsx().catch(() => {});
  }

  function init() {
    document.querySelectorAll("[data-excel-tool]").forEach((root) => {
      bindTool(root);
      requestAnimationFrame(() => {
        if (root._knzRedraw) root._knzRedraw();
      });
    });
  }

  window.ExcelAI = { init, bindTool, DATASETS, buildSql };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
