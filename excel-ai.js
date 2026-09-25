(function () {
  const MAX_BYTES = 1024 * 1024;
  const MAX_ROWS = 100;
  const MAX_INSERT_ROWS = 40;

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

  function isAllowedFile(file) {
    const name = (file.name || "").toLowerCase();
    return /\.(xlsx|xls|csv)$/.test(name);
  }

  function slugify(name, i) {
    const base = String(name || `col_${i + 1}`)
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48);
    const safe = base || `col_${i + 1}`;
    if (/^[0-9]/.test(safe)) return `c_${safe}`;
    return safe;
  }

  function uniqueNames(headers) {
    const seen = Object.create(null);
    return headers.map((h, i) => {
      let name = slugify(h, i);
      if (seen[name]) {
        seen[name] += 1;
        name = `${name}_${seen[name]}`;
      } else {
        seen[name] = 1;
      }
      return name;
    });
  }

  function isEmpty(v) {
    return v === null || v === undefined || String(v).trim() === "";
  }

  function detectType(values) {
    const nonEmpty = values.filter((v) => !isEmpty(v));
    if (!nonEmpty.length) return "text";
    let ints = 0;
    let nums = 0;
    let bools = 0;
    let dates = 0;
    nonEmpty.forEach((v) => {
      if (typeof v === "boolean" || /^(true|false|yes|no|да|нет)$/i.test(String(v).trim())) {
        bools += 1;
        return;
      }
      if (v instanceof Date && !Number.isNaN(v.getTime())) {
        dates += 1;
        return;
      }
      if (typeof v === "number" && Number.isFinite(v)) {
        nums += 1;
        if (Number.isInteger(v)) ints += 1;
        return;
      }
      const s = String(v).trim().replace(/\s/g, "").replace(",", ".");
      if (/^-?\d+$/.test(s)) {
        ints += 1;
        nums += 1;
        return;
      }
      if (/^-?\d+(\.\d+)?$/.test(s)) {
        nums += 1;
        return;
      }
      if (!Number.isNaN(Date.parse(String(v))) && /\d{4}|\d{1,2}[./-]\d{1,2}/.test(String(v))) {
        dates += 1;
      }
    });
    const n = nonEmpty.length;
    if (bools / n >= 0.85) return "boolean";
    if (dates / n >= 0.7) return "date";
    if (ints / n >= 0.9) return "integer";
    if (nums / n >= 0.85) return "numeric";
    return "text";
  }

  function pgType(kind) {
    if (kind === "integer") return "INTEGER";
    if (kind === "numeric") return "NUMERIC";
    if (kind === "boolean") return "BOOLEAN";
    if (kind === "date") return "TIMESTAMP";
    return "TEXT";
  }

  function sqlLiteral(v, kind) {
    if (isEmpty(v)) return "NULL";
    if (kind === "boolean") {
      const s = String(v).trim().toLowerCase();
      if (["true", "1", "yes", "да"].includes(s)) return "TRUE";
      if (["false", "0", "no", "нет"].includes(s)) return "FALSE";
      return "NULL";
    }
    if (kind === "integer" || kind === "numeric") {
      const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n) ? String(n) : "NULL";
    }
    if (kind === "date") {
      const d = v instanceof Date ? v : new Date(v);
      if (Number.isNaN(d.getTime())) return "NULL";
      return `'${d.toISOString().replace("T", " ").replace("Z", "")}'`;
    }
    return `'${String(v).replace(/'/g, "''")}'`;
  }

  function analyzeColumns(headers, rows) {
    const names = uniqueNames(headers);
    return names.map((name, i) => {
      const values = rows.map((r) => r[i]);
      const kind = detectType(values);
      const nonEmpty = values.filter((v) => !isEmpty(v));
      const uniq = new Set(nonEmpty.map((v) => String(v)));
      return {
        name,
        header: headers[i] || name,
        kind,
        pg: pgType(kind),
        nulls: values.length - nonEmpty.length,
        uniqueRatio: nonEmpty.length ? uniq.size / nonEmpty.length : 0,
        allPresent: nonEmpty.length === values.length && values.length > 0,
      };
    });
  }

  function suggestPk(cols) {
    const scored = cols
      .map((c) => {
        let score = 0;
        if (c.allPresent) score += 3;
        if (c.uniqueRatio >= 0.99) score += 5;
        else if (c.uniqueRatio >= 0.95) score += 2;
        if (c.kind === "integer") score += 2;
        if (/(^id$|_id$|^код$|^code$)/i.test(c.name) || /id|код|код/i.test(c.header)) score += 2;
        return { col: c, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best && best.score >= 6 && best.col.uniqueRatio >= 0.95 && best.col.allPresent) {
      return {
        mode: "column",
        column: best.col.name,
        reasonRu: `Рекомендуем PRIMARY KEY по колонке «${best.col.header}» (${best.col.name}): заполнена полностью, уникальность ${(best.col.uniqueRatio * 100).toFixed(0)}%.`,
        reasonEn: `Suggest PRIMARY KEY on «${best.col.header}» (${best.col.name}): fully populated, ${(best.col.uniqueRatio * 100).toFixed(0)}% unique.`,
      };
    }
    return {
      mode: "serial",
      column: "id",
      reasonRu: "Однозначного уникального столбца нет — предлагаем добавить SERIAL PRIMARY KEY id.",
      reasonEn: "No clear unique column — suggest adding a SERIAL PRIMARY KEY id.",
    };
  }

  function suggestChart(cols, rows) {
    const cats = cols.filter((c) => c.kind === "text" || c.kind === "boolean");
    const nums = cols.filter((c) => c.kind === "integer" || c.kind === "numeric");
    const dates = cols.filter((c) => c.kind === "date");
    if (dates.length && nums.length) {
      return {
        type: "line",
        x: dates[0],
        y: nums[0],
        noteRu: `Линейная: ось X — «${dates[0].header}», Y — «${nums[0].header}».`,
        noteEn: `Line chart: X «${dates[0].header}», Y «${nums[0].header}».`,
      };
    }
    if (cats.length && nums.length) {
      return {
        type: "bar",
        x: cats[0],
        y: nums[0],
        noteRu: `Столбчатая: категории «${cats[0].header}», значения «${nums[0].header}».`,
        noteEn: `Bar chart: categories «${cats[0].header}», values «${nums[0].header}».`,
      };
    }
    if (nums.length >= 2) {
      return {
        type: "scatter",
        x: nums[0],
        y: nums[1],
        noteRu: `Точечная: «${nums[0].header}» vs «${nums[1].header}».`,
        noteEn: `Scatter: «${nums[0].header}» vs «${nums[1].header}».`,
      };
    }
    return {
      type: "none",
      noteRu: "Для диаграммы мало подходящих колонок (нужна категория/дата + число).",
      noteEn: "Not enough suitable columns for a chart (need category/date + number).",
    };
  }

  function buildSql(tableName, cols, rows, pk) {
    const colDefs = cols.map((c) => `  ${c.name} ${c.pg}`).join(",\n");
    let create;
    if (pk.mode === "serial") {
      create = `CREATE TABLE ${tableName} (\n  id SERIAL PRIMARY KEY,\n${colDefs}\n);`;
    } else {
      create = `CREATE TABLE ${tableName} (\n${colDefs},\n  PRIMARY KEY (${pk.column})\n);`;
    }
    const names = cols.map((c) => c.name).join(", ");
    const slice = rows.slice(0, MAX_INSERT_ROWS);
    const inserts = slice.map((row) => {
      const vals = cols.map((c, i) => sqlLiteral(row[i], c.kind)).join(", ");
      return `INSERT INTO ${tableName} (${names}) VALUES (${vals});`;
    });
    const omitted = rows.length - MAX_INSERT_ROWS;
    const more =
      omitted > 0
        ? `\n-- ${t("auto_sql_more", `… ещё ${omitted} строк опущено для наглядности`).replace("{n}", String(omitted))}`
        : "";
    return `${create}\n\n${inserts.join("\n")}${more}\n`;
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

  async function ensureLibs() {
    if (!window.XLSX) {
      await loadScript("https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js");
    }
    if (!window.Chart) {
      await loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js");
    }
  }

  function matrixFromSheet(sheet) {
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
    if (!rows.length) return { headers: [], data: [] };
    const headers = (rows[0] || []).map((h, i) => (isEmpty(h) ? `Column ${i + 1}` : String(h)));
    const data = rows
      .slice(1)
      .filter((r) => r.some((c) => !isEmpty(c)))
      .map((r) => {
        const out = [];
        for (let i = 0; i < headers.length; i += 1) out.push(r[i] ?? "");
        return out;
      });
    return { headers, data };
  }

  function renderMeta(el, info) {
    el.innerHTML = `
      <p><strong>${t("auto_meta_file", "Файл")}:</strong> ${escapeHtml(info.fileName)}</p>
      <p><strong>${t("auto_meta_sheet", "Лист")}:</strong> ${escapeHtml(info.sheetName)}</p>
      <p><strong>${t("auto_meta_size", "Размер")}:</strong> ${(info.bytes / 1024).toFixed(1)} KB</p>
      <p><strong>${t("auto_meta_shape", "Строк × столбцов")}:</strong> ${info.rows} × ${info.cols}</p>
    `;
  }

  function renderCols(el, cols) {
    el.innerHTML = `<table class="auto-table"><thead><tr>
      <th>${t("auto_col_name", "Колонка")}</th>
      <th>${t("auto_col_type", "Тип")}</th>
      <th>${t("auto_col_nulls", "Пустых")}</th>
      <th>${t("auto_col_unique", "Уникальность")}</th>
    </tr></thead><tbody>
      ${cols
        .map(
          (c) => `<tr>
        <td>${escapeHtml(c.header)}<br><code>${escapeHtml(c.name)}</code></td>
        <td>${escapeHtml(c.pg)}</td>
        <td>${c.nulls}</td>
        <td>${(c.uniqueRatio * 100).toFixed(0)}%</td>
      </tr>`
        )
        .join("")}
    </tbody></table>`;
  }

  let chartInst = null;

  function renderChart(canvas, chart, cols, rows) {
    if (chartInst) {
      chartInst.destroy();
      chartInst = null;
    }
    if (!canvas || chart.type === "none" || !window.Chart) return;
    const xi = cols.indexOf(chart.x);
    const yi = cols.indexOf(chart.y);
    const labels = [];
    const values = [];
    const points = [];
    rows.slice(0, 40).forEach((r) => {
      const x = r[xi];
      const y = r[yi];
      if (isEmpty(y)) return;
      const num = typeof y === "number" ? y : Number(String(y).replace(",", "."));
      if (!Number.isFinite(num)) return;
      if (chart.type === "scatter") {
        const xn = typeof x === "number" ? x : Number(String(x).replace(",", "."));
        if (!Number.isFinite(xn)) return;
        points.push({ x: xn, y: num });
      } else {
        labels.push(String(x));
        values.push(num);
      }
    });
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0f766e";
    chartInst = new window.Chart(canvas.getContext("2d"), {
      type: chart.type === "scatter" ? "scatter" : chart.type,
      data: {
        labels: chart.type === "scatter" ? undefined : labels,
        datasets: [
          {
            label: chart.y.header,
            data: chart.type === "scatter" ? points : values,
            backgroundColor: accent,
            borderColor: accent,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: chart.type === "scatter" ? { x: {}, y: {} } : undefined,
      },
    });
  }

  async function handleFile(file, root) {
    const errEl = root.querySelector("[data-excel-error]");
    const result = root.querySelector("[data-excel-result]");
    const showErr = (msg) => {
      errEl.hidden = false;
      errEl.textContent = msg;
      result.hidden = true;
    };
    errEl.hidden = true;
    if (!file) return;
    if (!isAllowedFile(file)) {
      showErr(t("auto_err_type", "Нужен файл .xlsx, .xls или .csv."));
      return;
    }
    if (file.size > MAX_BYTES) {
      showErr(t("auto_err_size", "Файл больше 1 МБ."));
      return;
    }
    try {
      await ensureLibs();
      const buf = await file.arrayBuffer();
      const isCsv = /\.csv$/i.test(file.name || "");
      const wb = isCsv
        ? window.XLSX.read(new TextDecoder("utf-8").decode(buf), { type: "string", raw: false })
        : window.XLSX.read(buf, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        showErr(t("auto_err_empty", "В книге нет листов."));
        return;
      }
      const { headers, data } = matrixFromSheet(wb.Sheets[sheetName]);
      if (!headers.length || !data.length) {
        showErr(t("auto_err_nodata", "Нет строк данных на первом листе."));
        return;
      }
      if (data.length > MAX_ROWS) {
        showErr(t("auto_err_rows", "Больше 100 строк данных — обрежьте файл для демо."));
        return;
      }
      const cols = analyzeColumns(headers, data);
      const pk = suggestPk(cols);
      const chart = suggestChart(cols, data);
      const table = slugify(file.name.replace(/\.[^.]+$/, ""), 0) || "excel_import";
      const sql = buildSql(table, cols, data, pk);
      const lang = document.documentElement.lang || "ru";

      renderMeta(root.querySelector("[data-excel-meta]"), {
        fileName: file.name,
        sheetName,
        bytes: file.size,
        rows: data.length,
        cols: cols.length,
      });
      renderCols(root.querySelector("[data-excel-cols]"), cols);
      root.querySelector("[data-excel-pk]").textContent = lang === "en" ? pk.reasonEn : pk.reasonRu;
      root.querySelector("[data-excel-sql]").textContent = sql;
      root.querySelector("[data-excel-chart-note]").textContent =
        lang === "en" ? chart.noteEn : chart.noteRu;
      renderChart(root.querySelector("[data-excel-chart]"), chart, cols, data);
      result.hidden = false;
    } catch (e) {
      showErr(t("auto_err_parse", "Не удалось прочитать файл.") + " " + (e.message || ""));
    }
  }

  function bindTool(root) {
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    const drop = root.querySelector("[data-excel-drop]");
    const input = root.querySelector("[data-excel-input]");
    const copyBtn = root.querySelector("[data-excel-copy]");

    const openPicker = () => input?.click();
    drop?.addEventListener("click", openPicker);
    drop?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    });
    ["dragenter", "dragover"].forEach((ev) => {
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.add("is-drag");
      });
    });
    ["dragleave", "drop"].forEach((ev) => {
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.remove("is-drag");
      });
    });
    drop?.addEventListener("drop", (e) => {
      const f = e.dataTransfer?.files?.[0];
      if (f) handleFile(f, root);
    });
    input?.addEventListener("change", () => {
      const f = input.files?.[0];
      if (f) handleFile(f, root);
    });
    copyBtn?.addEventListener("click", async () => {
      const sql = root.querySelector("[data-excel-sql]")?.textContent || "";
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
  }

  function init() {
    document.querySelectorAll("[data-excel-tool]").forEach(bindTool);
  }

  window.ExcelAI = { init, bindTool };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
